<script lang="ts">
  interface Props {
    onreset: () => void;
    label?: string;
  }

  let { onreset, label = 'Reset' }: Props = $props();
</script>

<button
  type="button"
  class="reset-button"
  data-reset-button="true"
  onclick={onreset}
>
  <span class="icon" aria-hidden="true">↺</span>
  <span class="label">{label}</span>
</button>

<style>
  .reset-button {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border: 3px solid var(--black);
    background: var(--yellow);
    color: var(--black);
    font-family: var(--font-body);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    cursor: pointer;
    box-shadow: 4px 4px 0 var(--black);
    transition:
      transform 120ms ease,
      box-shadow 120ms ease;
  }

  .reset-button:hover,
  .reset-button:focus-visible {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--black);
    outline: none;
  }

  .reset-button:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 var(--black);
  }

  .icon {
    font-size: 1.1em;
    line-height: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .reset-button {
      transition: none;
    }
  }
</style>
