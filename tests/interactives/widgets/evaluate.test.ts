import { describe, it, expect } from 'vitest';
import { evaluateConfig } from '../../../src/lib/interactives/widgets/evaluate';

describe('evaluateConfig', () => {
  it('empty placed + no build → fatal (uniques required, missing first)', () => {
    const out = evaluateConfig({ placedIds: [], buildLoaded: false });
    expect(out.kind).toBe('fatal');
    expect(out.text).toMatch(/buildTreeDependentUniques/);
  });

  it('all four placed + no build = 141 MB → oom', () => {
    const out = evaluateConfig({
      placedIds: ['mods', 'uniques', 'ui', 'calc'],
      buildLoaded: false,
    });
    expect(out.kind).toBe('oom');
    expect(out.text).toMatch(/141\/128/);
  });

  it('all four placed + build = 163 MB → oom', () => {
    const out = evaluateConfig({
      placedIds: ['mods', 'uniques', 'ui', 'calc'],
      buildLoaded: true,
    });
    expect(out.kind).toBe('oom');
    expect(out.text).toMatch(/163\/128/);
  });

  it('skip UI, no build = 115 MB → fit', () => {
    const out = evaluateConfig({
      placedIds: ['mods', 'uniques', 'calc'],
      buildLoaded: false,
    });
    expect(out.kind).toBe('fit');
  });

  it('skip UI, with build = 137 MB → oom', () => {
    const out = evaluateConfig({
      placedIds: ['mods', 'uniques', 'calc'],
      buildLoaded: true,
    });
    expect(out.kind).toBe('oom');
    expect(out.text).toMatch(/137\/128/);
  });

  it('skip uniques (under capacity) → fatal', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'ui', 'calc'], buildLoaded: false });
    expect(out.kind).toBe('fatal');
    expect(out.text).toMatch(/buildTreeDependentUniques/);
  });

  it('skip calc (under capacity) → stuck', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'uniques', 'ui'], buildLoaded: false });
    expect(out.kind).toBe('stuck');
    expect(out.text).toMatch(/workspace/);
  });

  it('skip mods (under capacity) → silent catastrophe with DPS reveal', () => {
    const out = evaluateConfig({ placedIds: ['uniques', 'ui', 'calc'], buildLoaded: false });
    expect(out.kind).toBe('silent');
    expect(out.text).toMatch(/DPS: 48/);
    expect(out.revealRealAnswer).toEqual({ wrong: 48, real: 5_219_847 });
  });

  it('oom supersedes missing-required checks when both would apply', () => {
    // All three required present + UI + build would be 163 MB
    // If we swap UI out and keep the build, we drop to 137 MB > 128, still oom
    const out = evaluateConfig({
      placedIds: ['mods', 'uniques', 'calc'],
      buildLoaded: true,
    });
    expect(out.kind).toBe('oom');
  });

  it('uniques takes precedence over calc when both required are missing', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'ui'], buildLoaded: false });
    expect(out.kind).toBe('fatal');
    expect(out.text).toMatch(/buildTreeDependentUniques/);
  });

  it('fit outcome mentions pob-server', () => {
    const out = evaluateConfig({
      placedIds: ['mods', 'uniques', 'calc'],
      buildLoaded: false,
    });
    expect(out.text).toMatch(/pob-server/);
  });
});
