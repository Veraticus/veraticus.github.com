<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    ontoggle: (next: boolean) => void;
  }

  let { checked, label, ontoggle }: Props = $props();

  function onClick() {
    ontoggle(!checked);
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  class="toggle"
  class:checked
  onclick={onClick}
>
  <span class="track" aria-hidden="true">
    <span class="thumb"></span>
  </span>
  <span class="label">{label}</span>
</button>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.7rem;
    border: 3px solid var(--black);
    background: var(--bg);
    color: var(--black);
    font-family: var(--font-body);
    font-size: var(--text-base, 1rem);
    cursor: pointer;
    box-shadow: 4px 4px 0 var(--black);
    transition:
      transform 120ms ease,
      box-shadow 120ms ease,
      background 180ms ease;
  }

  .toggle:hover,
  .toggle:focus-visible {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--black);
    outline: none;
  }

  .toggle:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 var(--black);
  }

  .track {
    display: inline-block;
    width: 2.25rem;
    height: 1.1rem;
    background: rgba(26, 26, 26, 0.15);
    border: 2px solid var(--black);
    position: relative;
    transition: background 180ms ease;
  }

  .thumb {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 0.85rem;
    height: 0.85rem;
    background: var(--black);
    transition: transform 180ms ease;
  }

  .toggle.checked .track {
    background: var(--teal);
  }

  .toggle.checked .thumb {
    transform: translateX(1.05rem);
  }

  .label {
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    .toggle,
    .track,
    .thumb {
      transition: none;
    }
  }
</style>
