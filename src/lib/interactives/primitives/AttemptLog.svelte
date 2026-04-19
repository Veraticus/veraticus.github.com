<script lang="ts">
  export type AttemptResult = 'fit' | 'overflow' | 'error' | 'silent';

  export interface AttemptEntry {
    id: string;
    label: string;
    result: AttemptResult;
    text: string;
  }

  interface Props {
    entries: AttemptEntry[];
    emptyMessage?: string;
    label?: string;
  }

  let {
    entries,
    emptyMessage = 'No attempts yet.',
    label = 'Attempt log',
  }: Props = $props();
</script>

<section class="attempt-log" aria-label={label}>
  {#if entries.length === 0}
    <p class="empty">{emptyMessage}</p>
  {:else}
    <ol>
      {#each entries as entry (entry.id)}
        <li data-result={entry.result}>
          <span class="label">{entry.label}</span>
          <span class="arrow" aria-hidden="true">→</span>
          <span class="result-badge result-{entry.result}">{entry.result}</span>
          <span class="text">{entry.text}</span>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  .attempt-log {
    border: 3px solid var(--black);
    background: #0f1220;
    color: #d8d4c8;
    padding: 0.75rem 1rem;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    box-shadow: 4px 4px 0 var(--black);
    max-height: 14rem;
    overflow-y: auto;
  }

  .empty {
    margin: 0;
    opacity: 0.6;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: baseline;
    padding: 0.25rem 0;
    border-bottom: 1px dashed rgba(216, 212, 200, 0.12);
  }

  li:last-child {
    border-bottom: none;
  }

  .label {
    color: #f5efe3;
    font-weight: 600;
  }

  .arrow {
    color: #8a8577;
  }

  .result-badge {
    padding: 0.1rem 0.45rem;
    border: 2px solid var(--black);
    font-weight: 700;
    text-transform: uppercase;
    font-size: var(--text-xs, 0.75rem);
    letter-spacing: 0.04em;
  }

  .result-fit {
    background: var(--teal);
    color: var(--black);
  }
  .result-overflow,
  .result-error {
    background: var(--coral);
    color: var(--black);
  }
  .result-silent {
    background: var(--yellow);
    color: var(--black);
  }

  .text {
    flex: 1 1 auto;
  }
</style>
