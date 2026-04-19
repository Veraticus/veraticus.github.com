<script lang="ts">
  import { onMount } from 'svelte';
  import { useInteractiveFrame } from '../../primitives/InteractiveFrame.context';

  interface Props {
    text: string;
  }
  let { text }: Props = $props();

  const frame = useInteractiveFrame();
  let elapsed = $state(0);
  let tickHandle: ReturnType<typeof setInterval> | null = null;
  let revealed = $state(false);
  let revealHandle: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    if (frame.prefersReducedMotion) {
      revealed = true;
      return () => {};
    }
    const started = Date.now();
    tickHandle = setInterval(() => {
      elapsed = (Date.now() - started) / 1000;
    }, 100);
    revealHandle = setTimeout(() => {
      revealed = true;
    }, 5000);
    return () => {
      if (tickHandle) clearInterval(tickHandle);
      if (revealHandle) clearTimeout(revealHandle);
    };
  });
</script>

<aside class="stuck" aria-label="Calc hung waiting for workspace" aria-live="polite">
  <div class="spinner" aria-hidden="true"></div>
  <div class="body">
    <p class="headline">
      Running calc&hellip; <span class="timer">({elapsed.toFixed(1)}s)</span>
    </p>
    <code>{text}</code>
    {#if revealed}
      <p class="reveal">This never returns. Without calc temps PoB has nowhere to put the working set.</p>
    {/if}
  </div>
</aside>

<style>
  .stuck {
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 3px solid var(--black);
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
    padding: 1rem;
  }
  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--black);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 900ms linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
      border-top-color: var(--black);
    }
  }
  .body {
    flex: 1;
  }
  .headline {
    margin: 0 0 0.25rem 0;
    font-weight: 700;
  }
  .timer {
    font-family: var(--font-mono, monospace);
    font-weight: 400;
    opacity: 0.7;
  }
  code {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.75;
  }
  .reveal {
    margin: 0.5rem 0 0 0;
    font-size: var(--text-sm, 0.875rem);
    color: var(--coral);
    animation: fade-in 320ms ease-out 1;
  }
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal {
      animation: none;
    }
  }
</style>
