<script lang="ts">
  import type { Snippet } from 'svelte';
  import { handleKeyDown } from './keyboard';

  interface Props {
    id: string;
    label: string;
    size: number;
    placed: boolean;
    color?: 'teal' | 'coral' | 'yellow' | 'purple';
    ontoggle: (id: string) => void;
    children?: Snippet;
  }

  let {
    id,
    label,
    size,
    placed,
    color = 'teal',
    ontoggle,
    children,
  }: Props = $props();

  function onClick() {
    ontoggle(id);
  }

  function onKeyDown(e: KeyboardEvent) {
    const result = handleKeyDown({ focusedBlockId: id, pickedUpBlockId: null }, e);
    if (result.action?.type === 'toggle') {
      ontoggle(result.action.blockId);
    } else if (result.action?.type === 'blur') {
      (e.currentTarget as HTMLElement | null)?.blur();
    }
  }
</script>

<button
  type="button"
  aria-pressed={placed}
  class="draggable color-{color}"
  class:placed
  onclick={onClick}
  onkeydown={onKeyDown}
>
  <span class="label">{label}</span>
  <span class="size">{size} MB</span>
  {#if children}
    <span class="extra">{@render children()}</span>
  {/if}
</button>

<style>
  .draggable {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    padding: 0.75rem 1rem;
    border: 3px solid var(--black);
    box-shadow: 4px 4px 0 var(--black);
    background: var(--teal);
    color: var(--black);
    font-family: var(--font-body);
    font-size: var(--text-base, 1rem);
    text-align: left;
    cursor: pointer;
    min-width: 8rem;
    transition:
      transform 120ms ease,
      box-shadow 120ms ease,
      filter 180ms ease;
  }

  .color-teal {
    background: var(--teal);
  }
  .color-coral {
    background: var(--coral);
  }
  .color-yellow {
    background: var(--yellow);
  }
  .color-purple {
    background: #7c5cff;
    color: var(--bg);
  }

  .draggable:hover,
  .draggable:focus-visible {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--black);
    outline: none;
  }

  .draggable:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 var(--black);
  }

  .draggable.placed {
    filter: saturate(0.4) brightness(1.15);
  }

  .label {
    font-weight: 600;
  }

  .size {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.8;
  }
</style>
