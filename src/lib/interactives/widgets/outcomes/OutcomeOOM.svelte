<script lang="ts">
  interface Props {
    text: string;
  }
  let { text }: Props = $props();
</script>

<aside class="oom" aria-label="Worker terminated (out of memory)">
  <div class="badge">503</div>
  <div class="body">
    <p class="headline">Worker terminated.</p>
    <code>{text}</code>
  </div>
</aside>

<style>
  .oom {
    display: flex;
    align-items: stretch;
    gap: 0;
    border: 3px solid var(--black);
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
  }
  .badge {
    background: var(--coral);
    color: var(--black);
    padding: 1rem 1.25rem;
    font-family: var(--font-mono, monospace);
    font-weight: 700;
    font-size: var(--text-xl, 1.5rem);
    border-right: 3px solid var(--black);
    display: flex;
    align-items: center;
  }
  .body {
    padding: 0.75rem 1rem;
    flex: 1;
  }
  .headline {
    margin: 0 0 0.25rem 0;
    font-weight: 700;
  }
  code {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    color: var(--black);
  }
</style>
