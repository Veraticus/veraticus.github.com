<script lang="ts">
  import type { SquiggleFlavor, SquiggleColor } from './Squiggle.types';

  interface Props {
    flavor?: SquiggleFlavor;
    color?: SquiggleColor;
    /** Stroke thickness in px. Scales with title size. */
    stroke?: number;
    /** Height of the SVG in em, relative to the title's font size. */
    height?: number;
  }
  let {
    flavor = 'zigzag',
    color = 'coral',
    stroke = 2,
    height = 0.45,
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

<svg
  class="squiggle flavor-{flavor}"
  viewBox="0 0 60 8"
  preserveAspectRatio="none"
  style:height="{height}em"
  aria-hidden="true"
>
  {#if flavor === 'zigzag'}
    <polyline
      points="0,7 5,1 10,7 15,1 20,7 25,1 30,7 35,1 40,7 45,1 50,7 55,1 60,7"
      fill="none"
      stroke={strokeColor}
      stroke-width={stroke}
      stroke-linejoin="miter"
      stroke-linecap="round"
    />
  {:else if flavor === 'dash'}
    <line
      x1="0"
      y1="4"
      x2="60"
      y2="4"
      stroke={strokeColor}
      stroke-width={stroke}
      stroke-dasharray="5 3"
      stroke-linecap="round"
    />
  {:else if flavor === 'wave'}
    <path
      d="M 0 4 Q 3.75 0 7.5 4 T 15 4 T 22.5 4 T 30 4 T 37.5 4 T 45 4 T 52.5 4 T 60 4"
      fill="none"
      stroke={strokeColor}
      stroke-width={stroke}
      stroke-linecap="round"
    />
  {:else}
    <!-- arc: hand-drawn squiggle with irregular amplitudes -->
    <path
      d="M 0 5 Q 5 1 10 4 Q 15 8 20 3 Q 25 0 30 5 Q 35 7 40 2 Q 45 0 50 6 Q 55 8 60 3"
      fill="none"
      stroke={strokeColor}
      stroke-width={stroke}
      stroke-linecap="round"
    />
  {/if}
</svg>

<style>
  .squiggle {
    display: block;
    width: 100%;
    margin-top: 0.1em;
    overflow: visible;
  }
</style>
