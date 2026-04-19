<script lang="ts">
  import type { SquiggleFlavor, SquiggleColor } from './Squiggle.types';

  interface Props {
    /** Currently ignored -- kept for API compat. All squiggles render the same flowing wave. */
    flavor?: SquiggleFlavor;
    color?: SquiggleColor;
    /** Stroke thickness in px. */
    stroke?: number;
    /** SVG height in em, relative to parent font size. */
    height?: number;
  }
  let {
    flavor: _flavor = 'wave',
    color = 'coral',
    stroke = 4,
    height = 0.5,
  }: Props = $props();

  const strokeColor = $derived(
    color === 'teal'
      ? 'var(--teal)'
      : color === 'coral'
        ? 'var(--coral)'
        : color === 'yellow'
          ? 'var(--yellow)'
          : color === 'purple'
            ? '#7c5cff'
            : 'var(--black)',
  );
</script>

<!--
  A single flowing wavy underline. Alternating peaks (y=2) and troughs (y=12)
  over a 14-unit tall viewBox, 9 Q-curve segments across 220 units wide -- the
  same hand-drawn squiggle style Josh uses in his slide decks.
-->
<svg
  class="squiggle"
  viewBox="0 0 220 14"
  preserveAspectRatio="none"
  style:height="{height}em"
  aria-hidden="true"
>
  <path
    d="M2 7 Q14 2 26 7 Q38 12 50 7 Q62 2 74 7 Q86 12 98 7 Q110 2 122 7 Q134 12 146 7 Q158 2 170 7 Q182 12 194 7 Q206 2 218 7"
    fill="none"
    stroke={strokeColor}
    stroke-width={stroke}
    stroke-linecap="round"
  />
</svg>

<style>
  .squiggle {
    display: block;
    width: 100%;
    margin-top: 0.15em;
    overflow: visible;
  }
</style>
