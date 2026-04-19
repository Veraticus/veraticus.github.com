<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    used: number;
    capacity: number;
    children?: Snippet;
    onmount?: (el: HTMLElement) => void;
  }

  let { label, used, capacity, children, onmount }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();
  $effect(() => {
    if (rootEl && onmount) onmount(rootEl);
  });

  let overflowing = $derived(used > capacity);
  let fillPercent = $derived(Math.min(100, (used / capacity) * 100));
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
    <span class="label">{label}</span>
    <span class="readout">
      <span data-testid="used">{used}</span>
      <span class="divider">/</span>
      <span data-testid="capacity">{capacity}</span>
      <span class="unit">MB</span>
    </span>
  </header>

  <div class="bar" aria-hidden="true">
    <div class="bar-fill" style:width="{fillPercent}%"></div>
    <div class="ceiling"></div>
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

  .label {
    font-weight: 600;
    font-size: var(--text-lg, 1.125rem);
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

  .bar {
    position: relative;
    height: 10px;
    background: rgba(26, 26, 26, 0.1);
    border: 2px solid var(--black);
    overflow: visible;
    margin-bottom: 0.75rem;
  }

  .bar-fill {
    height: 100%;
    background: var(--teal);
    transition: width 240ms ease;
  }

  .ceiling {
    position: absolute;
    top: -4px;
    right: 0;
    bottom: -4px;
    width: 2px;
    background: var(--black);
  }

  .drop-target.overflowing .bar-fill {
    background: var(--coral);
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
    .bar-fill {
      transition: none;
    }
  }

  .contents {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 3rem;
  }
</style>
