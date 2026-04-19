<script lang="ts">
  import { onMount } from 'svelte';
  import { useInteractiveFrame } from '../../primitives/InteractiveFrame.context';

  interface Props {
    wrong: number;
    real: number;
  }
  let { wrong, real }: Props = $props();

  const frame = useInteractiveFrame();
  let showReal = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    if (frame.prefersReducedMotion) {
      showReal = true;
      return () => {};
    }
    timer = setTimeout(() => {
      showReal = true;
    }, 2000);
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  function fmt(n: number): string {
    return n.toLocaleString('en-US');
  }
</script>

<aside class="silent" aria-label="Calc completed silently with a wrong DPS">
  <div class="check" aria-hidden="true">✓</div>
  <div class="body">
    <p class="headline">Calc complete.</p>
    <p class="dps">
      DPS: <span class="wrong">{fmt(wrong)}</span>
      {#if showReal}
        <span class="real">
          <s>{fmt(real)}</s>
        </span>
      {/if}
    </p>
    <p class="caption">PoB has no way to know it's wrong.</p>
  </div>
</aside>

<style>
  .silent {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    border: 3px solid var(--black);
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
    padding: 1rem;
  }
  .check {
    background: var(--teal);
    color: var(--black);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border: 3px solid var(--black);
    flex-shrink: 0;
  }
  .body {
    flex: 1;
  }
  .headline {
    margin: 0 0 0.25rem 0;
    font-weight: 700;
  }
  .dps {
    margin: 0 0 0.25rem 0;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-lg, 1.125rem);
  }
  .wrong {
    font-weight: 700;
  }
  .real {
    margin-left: 0.75rem;
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
    .real {
      animation: none;
    }
  }
  .caption {
    margin: 0;
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.7;
  }
</style>
