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
  <div class="top-row">
    <div class="check" aria-hidden="true">✓</div>
    <p class="headline">Calc complete.</p>
  </div>
  <div class="body">
    <p class="dps">DPS: <span class="wrong">{fmt(wrong)}</span></p>
    <aside class="reveal">
      Should be <strong>{fmt(real)}</strong>. Without the mod tables, every item modifier evaluated to zero -- PoB ran the calc against a naked character.
    </aside>
  </div>
</aside>

<style>
  .silent {
    border: 3px solid var(--black);
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
    padding: 0.75rem 1rem;
  }
  .top-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .check {
    background: var(--teal);
    color: var(--black);
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border: 3px solid var(--black);
    flex-shrink: 0;
  }
  .headline {
    margin: 0;
    font-weight: 700;
  }
  .body {
    margin-top: 0.5rem;
  }
  .dps {
    margin: 0 0 0.4rem 0;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-lg, 1.125rem);
  }
  .wrong {
    font-weight: 700;
  }
  .reveal {
    display: block;
    margin: 0;
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
</style>
