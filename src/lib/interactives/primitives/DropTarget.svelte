<script lang="ts">
  import type { Snippet } from 'svelte';
  import FillBar from './FillBar.svelte';
  import Squiggle from './Squiggle.svelte';
  import type { SquiggleFlavor, SquiggleColor } from './Squiggle.types';

  interface Props {
    label: string;
    used: number;
    capacity: number;
    children?: Snippet;
    onmount?: (el: HTMLElement) => void;
    labelSquiggle?: SquiggleFlavor;
    labelSquiggleColor?: SquiggleColor;
  }

  let {
    label,
    used,
    capacity,
    children,
    onmount,
    labelSquiggle = 'arc',
    labelSquiggleColor = 'teal',
  }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();
  $effect(() => {
    if (rootEl && onmount) onmount(rootEl);
  });

  let overflowing = $derived(used > capacity);
</script>

<div
  bind:this={rootEl}
  class="drop-target"
  class:overflowing
  role="region"
  aria-label={label}
  data-overflowing={overflowing}
>
  <header class="header">
    <span class="label-wrap">
      <span class="label">{label}</span>
      <Squiggle flavor={labelSquiggle} color={labelSquiggleColor} stroke={2.5} height={0.45} />
    </span>
    <span class="readout">
      <span data-testid="used">{used}</span>
      <span class="divider">/</span>
      <span data-testid="capacity">{capacity}</span>
      <span class="unit">MB</span>
    </span>
  </header>

  <div class="bar-wrap">
    <FillBar value={used} max={capacity} unit="MB" label={`${label} memory usage`} />
  </div>

  <div class="contents">
    {@render children?.()}
  </div>
</div>

<style>
  .drop-target {
    display: block;
    border: 3px solid var(--black);
    padding: 1rem;
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.5rem;
    font-family: var(--font-body);
  }

  .label-wrap {
    display: inline-block;
  }

  .label {
    font-weight: 700;
    font-size: 1.2rem;
    line-height: 1.1;
  }

  .readout {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
  }

  .divider {
    opacity: 0.5;
    margin: 0 0.25rem;
  }

  .unit {
    margin-left: 0.25rem;
    opacity: 0.7;
  }

  .bar-wrap {
    margin-bottom: 0.75rem;
  }

  .drop-target.overflowing {
    animation: shake 360ms ease-in-out 1;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-4px, 2px);
    }
    50% {
      transform: translate(3px, -2px);
    }
    75% {
      transform: translate(-2px, 3px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .drop-target.overflowing {
      animation: none;
    }
  }

  .contents {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 3rem;
  }
</style>
