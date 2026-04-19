<script lang="ts">
  interface Props {
    text: string;
  }
  let { text }: Props = $props();

  const bootLines = [
    'Loading main script...',
    "Loading passive tree data for version '3.28'...",
    'Loading passive tree assets...',
  ];
</script>

<aside class="fatal" aria-label="Path of Building failed to boot">
  <div class="boot">
    {#each bootLines as line (line)}
      <span class="ok">{line}</span>
    {/each}
    <span class="fail">Error:</span>
    <span class="fail">In 'Init': {text}</span>
  </div>
</aside>

<style>
  .fatal {
    display: block;
    border: 3px solid var(--black);
    background: #0f1220;
    box-shadow: 4px 4px 0 var(--black);
  }
  .boot {
    padding: 0.55rem 0.85rem;
    background: #0f1220;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.4;
    color: #d8d4c8;
    word-break: break-word;
  }
  .ok,
  .fail {
    display: block;
  }
  .ok {
    color: #8ab37a;
  }
  .fail {
    color: #ff6b6b;
  }
</style>
