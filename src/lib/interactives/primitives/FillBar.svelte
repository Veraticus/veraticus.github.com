<script lang="ts">
  interface Props {
    value: number;
    max: number;
    unit?: string;
    label?: string;
  }

  let { value, max, unit = '', label }: Props = $props();

  const overflowing = $derived(value > max);
  const fillPercent = $derived(max <= 0 ? 0 : Math.min(100, (value / max) * 100));
  const valueText = $derived(
    unit ? `${value} of ${max} ${unit}` : `${value} of ${max}`,
  );
</script>

<div
  class="fill-bar"
  class:overflowing
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuetext={valueText}
  aria-label={label}
  data-overflowing={overflowing}
>
  <div class="fill-bar-inner" style:width="{fillPercent}%"></div>
  <div class="fill-bar-ceiling" aria-hidden="true"></div>
</div>

<style>
  .fill-bar {
    position: relative;
    height: 10px;
    background: rgba(26, 26, 26, 0.1);
    border: 2px solid var(--black);
    overflow: visible;
  }

  .fill-bar-inner {
    height: 100%;
    background: var(--teal);
    transition: width 240ms ease;
  }

  .fill-bar.overflowing .fill-bar-inner {
    background: var(--coral);
  }

  .fill-bar-ceiling {
    position: absolute;
    top: -4px;
    right: 0;
    bottom: -4px;
    width: 2px;
    background: var(--black);
  }

  @media (prefers-reduced-motion: reduce) {
    .fill-bar-inner {
      transition: none;
    }
  }
</style>
