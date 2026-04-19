<script lang="ts">
  interface Props {
    text: string;
  }
  let { text }: Props = $props();
</script>

<aside class="stuck" aria-label="Calc hung waiting for workspace" aria-live="polite">
  <div class="spinner" aria-hidden="true"></div>
  <div class="body">
    <p class="headline">Running calc&hellip;</p>
    <code>{text}</code>
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
  code {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.75;
  }
</style>
