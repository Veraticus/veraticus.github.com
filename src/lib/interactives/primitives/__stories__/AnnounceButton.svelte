<script lang="ts">
  import { useInteractiveFrame } from '../InteractiveFrame.svelte';

  interface Props {
    label?: string;
    message?: string;
  }
  let { label = 'Announce', message = 'State changed' }: Props = $props();

  const frame = useInteractiveFrame();
</script>

<button type="button" onclick={() => frame.announce(message)}>
  {label}
</button>
<p class="motion-indicator">
  Motion preference: {frame.prefersReducedMotion ? 'reduced' : 'full'}
</p>

<style>
  button {
    border: 3px solid var(--black);
    background: var(--teal);
    color: var(--black);
    padding: 0.5rem 1rem;
    font-family: var(--font-body);
    font-size: var(--text-base, 1rem);
    cursor: pointer;
    box-shadow: 4px 4px 0 var(--black);
    transition: transform 120ms ease;
  }
  button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--black);
  }
  button:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 var(--black);
  }
  .motion-indicator {
    margin-top: 0.5rem;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    color: var(--black);
  }
</style>
