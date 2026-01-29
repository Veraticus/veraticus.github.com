# Creative Lab - ComfyUI Workflows

## WAN 2.2 I2V Hero Video

Location: `comfyui/wan-i2v/`

### Quick Start (Two-Step Process)

1. **Generate I2V** (~16 min): Submit `workflow-i2v-only.json`
   - Review output at `/var/lib/comfyui/output/josh_i2v_creative_*.mp4`
   - If good, proceed to step 2

2. **Upscale** (~6 min): Submit `workflow-upscale-only.json`
   - Loads I2V output, runs SeedVR2 + RIFE
   - Final output: `josh_hero_final_00001.mp4`

### Workflow Files

| File | Purpose |
|------|---------|
| `workflow-i2v-only.json` | I2V generation, saves base video |
| `workflow-upscale-only.json` | Loads base, runs SeedVR2 + RIFE |
| `workflow.json` | Combined full pipeline |

---

## Understanding High Noise vs Low Noise

WAN 2.2 uses two specialized models (Mixture of Experts):

| Phase | What Happens | Model |
|-------|--------------|-------|
| **High Noise** (early steps) | Motion planning, composition, structure | HighNoise model |
| **Low Noise** (late steps) | Refinement, details, cleanup | LowNoise model |

**Critical insight**: Too many high noise steps = frozen/slow motion. The model keeps re-planning instead of committing.

### Step Distribution (NO Lightning LoRA)

| High Steps | Result |
|------------|--------|
| 3 | Too fast |
| 4-5 | Normal motion |
| 5+ | Slow motion starts |
| 10+ | Frozen/paper cutout |

**Recommended**: 5 high + 15 low = 20 total steps

### Why Lightning LoRA Masked This

Lightning LoRA is trained to compress motion dynamics into fewer steps. When removed:
- Old workflow (3 high + 5 low with LoRA) had motion
- Same steps without LoRA = no motion compensation
- Fix: Drop high steps dramatically, not increase them

---

## Key Settings

### CFG (Classifier-Free Guidance)
- **HighNoise CFG 3.5**: Good prompt adherence for motion instructions
- **LowNoise CFG 1.0**: Flexible refinement
- Too low CFG = ignores "breathes and blinks" instructions

### Shift Value
- Controls noise schedule / motion intensity
- **Shift 8.0**: Good motion energy
- Higher = more dramatic, Lower = gentler

### Prompting for Micro-Expressions

**BAD** (too vague):
```
man seated on stool breathes and blinks, foot shifts position
```

**GOOD** (beat-structured):
```
Beat 1 (0-2s): His chest rises with a slow breath, eyelids lowering
momentarily then reopening with subtle brow movement.
Beat 2 (2-4s): A micro-expression crosses his face as his gaze drifts,
jaw relaxing, geometric shapes on suit begin transforming.
Beat 3 (4-6s): Background shapes rotate and slide, patterns animate.
Beat 4 (6-8s): Breathing steadies, eyes blink naturally, returns to start.
```

### FLF (First-Last-Frame) Loop Constraints

Using same image for start AND end frame **inherently suppresses motion**:
- Model must return to exact starting position
- Prioritizes seamless looping over animation
- Micro-expressions possible but require very specific prompting
- Large body movements suppressed (would create jarring transitions)

---

## Advanced: ClownsharkSampler

For better prompt adherence, use [RES4LYF](https://github.com/ClownsharkBatwing/RES4LYF):
- Sampler: `res_2s`
- Significantly better than KSamplerAdvanced for WAN

Install: Added to `nix-config/hosts/stygianlibrary/comfyui/pre-start.sh`

---

## Memory Optimization (16GB VRAM)

### SeedVR2 DiT Model
```json
"blocks_to_swap": 20,
"attention_mode": "sageattn_2",
"offload_device": "cpu"
```

### SeedVR2 VAE
```json
"encode_tiled": true,
"encode_tile_size": 512,
"decode_tiled": true,
"decode_tile_size": 512
```

### Batch Processing
```json
"batch_size": 13,
"temporal_overlap": 4,
"uniform_batch_size": true
```

---

## Performance with SageAttention

| Stage | Without Sage | With Sage |
|-------|-------------|-----------|
| I2V step | ~110s | ~74s |
| SeedVR2 batch | ~15s | ~11s |
| **Speedup** | - | **~33%** |

---

## Negative Prompt (Face Stability)

```
deformed face, morphing, melting, warped features, jitter, flicker,
unstable identity, extra limbs, camera movement, zoom, pan, fast motion,
worst quality, low quality
```

---

## Container Setup

Pre-start script: `nix-config/hosts/stygianlibrary/comfyui/pre-start.sh`
- Installs SageAttention + FlashAttention
- Auto-installs custom nodes (WAN, GGUF, SeedVR2, RIFE, RES4LYF)
- Sets `--use-sage-attention` CLI flag

---

## Sources

- r/StableDiffusion "How many High-Steps are needed?" - Step distribution research
- r/StableDiffusion "Realism, Motion and Emotion" - Beat-structured prompting
- [RES4LYF](https://github.com/ClownsharkBatwing/RES4LYF) - ClownsharkSampler
- [SeedVR2 GitHub](https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler) - Memory optimization
- [flash-attention-prebuild-wheels](https://github.com/mjun0812/flash-attention-prebuild-wheels) - Pre-built wheels
