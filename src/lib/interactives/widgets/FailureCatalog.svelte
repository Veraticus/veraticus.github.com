<script lang="ts" module>
  import type { OutcomeKind } from './evaluate';

  export interface CatalogItem {
    kind: OutcomeKind;
    label: string;
  }

  // Ordered loudest → subtlest for narrative effect.
  // The Silent row is the emotional payoff; the Fit row is the only achievable
  // "success" (headless); the Impossible row below is the thesis punchline.
  export const CATALOG_ITEMS: readonly CatalogItem[] = [
    { kind: 'oom', label: 'Worker terminated (memory overflow)' },
    { kind: 'fatal', label: "PoB refuses to boot (uniques stripped)" },
    { kind: 'stuck', label: 'calc() hangs forever (calc temps stripped)' },
    { kind: 'silent', label: 'DPS silently reads 48 (mod tables stripped)' },
    { kind: 'fit', label: 'Fits headless, no build loaded (UI stripped)' },
  ];
</script>

<script lang="ts">
  interface Props {
    seenKinds: Set<OutcomeKind>;
    label?: string;
  }
  let { seenKinds, label = 'Failure catalog' }: Props = $props();
</script>

<section class="catalog" aria-label={label}>
  <header class="catalog-header">Failure catalog</header>
  <ul>
    {#each CATALOG_ITEMS as item (item.kind)}
      {@const reached = seenKinds.has(item.kind)}
      <li
        class="item"
        class:reached
        data-kind={item.kind}
        aria-checked={reached}
        role="checkbox"
      >
        <span class="box" aria-hidden="true">
          {#if reached}✓{/if}
        </span>
        <span class="label">{item.label}</span>
      </li>
    {/each}
    <li class="item impossible" aria-checked="false" role="checkbox" aria-disabled="true">
      <span class="box" aria-hidden="true"></span>
      <span class="label">It all works and fits in 128&nbsp;MB</span>
      <span class="tag">impossible</span>
    </li>
  </ul>
</section>

<style>
  .catalog {
    border: 3px solid var(--black);
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
    padding: 0.75rem 1rem;
  }
  .catalog-header {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-xs, 0.75rem);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--black);
    opacity: 0.55;
    margin-bottom: 0.5rem;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0;
    font-family: var(--font-body);
    color: var(--black);
    opacity: 0.6;
    transition: opacity 220ms ease;
  }
  .item.reached {
    opacity: 1;
  }
  .box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--black);
    background: var(--bg);
    font-weight: 700;
    flex-shrink: 0;
    transition: background 220ms ease;
  }
  .item.reached .box {
    background: var(--teal);
  }
  .label {
    flex: 1;
  }
  .item.impossible {
    margin-top: 0.5rem;
    padding-top: 0.6rem;
    border-top: 2px dashed rgba(26, 26, 26, 0.25);
    font-style: italic;
    opacity: 0.5;
  }
  .item.impossible .box {
    background: repeating-linear-gradient(
      45deg,
      transparent 0,
      transparent 3px,
      rgba(26, 26, 26, 0.35) 3px,
      rgba(26, 26, 26, 0.35) 5px
    );
  }
  .tag {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-xs, 0.75rem);
    padding: 0.1rem 0.45rem;
    border: 2px solid var(--black);
    background: var(--coral);
    color: var(--black);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.04em;
    font-style: normal;
  }
  @media (prefers-reduced-motion: reduce) {
    .item,
    .box {
      transition: none;
    }
  }
</style>
