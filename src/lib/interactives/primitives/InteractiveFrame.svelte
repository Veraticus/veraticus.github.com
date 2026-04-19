<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { INTERACTIVE_FRAME_KEY, type FrameContext } from './InteractiveFrame.context';

  interface Props {
    title?: string;
    children?: import('svelte').Snippet;
  }

  let { title = 'Interactive', children }: Props = $props();

  let prefersReducedMotion = $state(false);
  let announcement = $state('');

  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  function announce(msg: string) {
    // Clearing first forces the live region to re-announce identical strings.
    announcement = '';
    queueMicrotask(() => {
      announcement = msg;
    });
  }

  const ctx: FrameContext = {
    get prefersReducedMotion() {
      return prefersReducedMotion;
    },
    announce,
  };
  setContext(INTERACTIVE_FRAME_KEY, ctx);
</script>

<section class="interactive-frame" aria-label={title}>
  <h3>{title}</h3>
  <div class="interactive-frame-body">
    {@render children?.()}
  </div>
  <div class="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
</section>

<style>
  .interactive-frame {
    border: 3px solid var(--black);
    padding: 0.75rem 1rem 1rem;
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
    position: relative;
  }

  .interactive-frame h3 {
    margin: 0 0 0.35rem 0;
    padding: 0;
    font-family: var(--font-heading, var(--font-body));
    font-size: 1.05rem;
    line-height: 1.15;
    font-weight: 700;
  }

  .interactive-frame-body {
    display: block;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
