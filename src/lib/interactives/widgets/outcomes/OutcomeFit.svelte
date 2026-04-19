<script lang="ts">
  interface Props {
    text: string;
  }
  let { text }: Props = $props();
</script>

<aside class="fit" aria-label="Configuration fits headless">
  <div class="check" aria-hidden="true">✓</div>
  <div class="body">
    <p class="headline">Fits.</p>
    <p class="caption">{text}</p>
  </div>
</aside>

<style>
  .fit {
    display: flex;
    align-items: center;
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
  .caption {
    margin: 0;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.75;
  }
</style>
