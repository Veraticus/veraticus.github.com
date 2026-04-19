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
  <pre class="boot">
{#each bootLines as line (line)}<span class="ok">{line}</span>
{/each}<span class="fail">^1Error:</span>
<span class="fail">^0In 'Init': {text}</span>
<span class="fail">^8v2.63.0</span>
<span class="fail">^0Press Enter/Escape to dismiss, or F5 to restart the application.</span>
<span class="fail">Press CTRL + C to copy error text.</span>
  </pre>
</aside>

<style>
  .fatal {
    display: block;
    border: 3px solid var(--black);
    background: #0f1220;
    box-shadow: 4px 4px 0 var(--black);
  }
  .boot {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #0f1220;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.5;
    color: #d8d4c8;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .ok {
    color: #8ab37a;
    display: block;
  }
  .fail {
    color: #ff6b6b;
    display: block;
  }
</style>
