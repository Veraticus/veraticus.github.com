<script lang="ts">
  interface Props {
    wrong: number;
    real: number;
  }
  let { wrong, real }: Props = $props();

  function fmt(n: number): string {
    return n.toLocaleString('en-US');
  }
</script>

<aside class="silent" aria-label="Calc completed silently with a wrong DPS">
  <div class="check" aria-hidden="true">✓</div>
  <div class="body">
    <p class="headline">Calc complete.</p>
    <p class="dps">DPS: <span class="wrong">{fmt(wrong)}</span></p>
    <aside class="reveal">
      Should be <strong>{fmt(real)}</strong>. Without the mod tables, every item modifier evaluated to zero &mdash; PoB ran the calc against a naked character.
    </aside>
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
  .reveal {
    display: block;
    margin: 0.4rem 0 0.5rem 0;
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--black);
    background: var(--yellow);
    color: var(--black);
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.4;
    box-shadow: 3px 3px 0 var(--black);
  }
  .reveal strong {
    font-family: var(--font-mono, monospace);
    font-weight: 700;
  }
  .caption {
    margin: 0;
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.7;
  }
</style>
