<script lang="ts">
  import { flushSync, type Snippet } from 'svelte';
  import { handleKeyDown } from './keyboard';
  import {
    createDragState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    type DragState,
  } from './drag';
  import type { Position } from './pointer';

  interface Props {
    id: string;
    label: string;
    size: number;
    placed: boolean;
    color?: 'teal' | 'coral' | 'yellow' | 'purple' | 'green';
    description?: string;
    ontoggle: (id: string) => void;
    ondragmove?: (id: string, position: Position) => void;
    ondragend?: (id: string, position: Position) => void;
    children?: Snippet;
  }

  let {
    id,
    label,
    size,
    placed,
    color = 'teal',
    description,
    ontoggle,
    ondragmove,
    ondragend,
    children,
  }: Props = $props();

  let drag = $state<DragState>(createDragState());
  let suppressNextClick = $state(false);
  let buttonEl: HTMLButtonElement | undefined = $state();
  let layoutLeft = 0;
  let layoutTop = 0;

  function onClick() {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
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

  function onPointerDown(e: PointerEvent) {
    const target = e.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // Not all environments support pointer capture (older jsdom, some browsers under test).
      // The drag state machine still works without it.
    }
    // Capture the button's layout position (no transform applied yet at pointerdown).
    const rect = target.getBoundingClientRect();
    layoutLeft = rect.left;
    layoutTop = rect.top;
    drag = handlePointerDown(drag, id, e);
  }

  function onPointerMove(e: PointerEvent) {
    if (drag.draggingId === null) return;
    drag = handlePointerMove(drag, e);
    if (!drag.moved) return;

    ondragmove?.(id, { x: e.clientX, y: e.clientY });

    // After ondragmove, the parent may have reordered the array and our
    // DOM slot may now be at a new layout position. Force Svelte to flush
    // so getBoundingClientRect reflects the new slot, then recompute origin
    // and offset so the block stays pinned to the pointer (adjust origin
    // for future moves, adjust offset so the current paint is correct).
    flushSync();
    if (!buttonEl) return;
    const rect = buttonEl.getBoundingClientRect();
    const currentLayoutLeft = rect.left - drag.offset.x;
    const currentLayoutTop = rect.top - drag.offset.y;
    const dx = currentLayoutLeft - layoutLeft;
    const dy = currentLayoutTop - layoutTop;
    if (dx !== 0 || dy !== 0) {
      drag = {
        ...drag,
        origin: { x: drag.origin.x + dx, y: drag.origin.y + dy },
        offset: { x: drag.offset.x - dx, y: drag.offset.y - dy },
      };
      layoutLeft = currentLayoutLeft;
      layoutTop = currentLayoutTop;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (drag.draggingId === null) return;
    const { state: next, result } = handlePointerUp(drag, e);
    drag = next;
    if (result.moved && result.dropId !== null && result.dropPosition !== null) {
      suppressNextClick = true;
      ondragend?.(result.dropId, result.dropPosition);
    }
    const target = e.currentTarget as HTMLElement;
    try {
      target.releasePointerCapture(e.pointerId);
    } catch {
      // same tolerance as setPointerCapture above
    }
  }

  function onPointerCancel() {
    drag = createDragState();
  }

  let isDragging = $derived(drag.draggingId !== null && drag.moved);
  let translateStyle = $derived(
    drag.draggingId !== null
      ? `translate(${drag.offset.x}px, ${drag.offset.y}px)`
      : 'translate(0, 0)',
  );
</script>

<button
  bind:this={buttonEl}
  type="button"
  aria-pressed={placed}
  class="draggable color-{color}"
  class:placed
  class:dragging={isDragging}
  data-dragging={isDragging}
  data-draggable-id={id}
  style:transform={translateStyle}
  onclick={onClick}
  onkeydown={onKeyDown}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
>
  <span class="label">{label}</span>
  <span class="size">{size} MB</span>
  {#if description}
    <span class="description">{description}</span>
  {/if}
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
    cursor: grab;
    min-width: 8rem;
    touch-action: none;
    user-select: none;
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
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
  .color-green {
    background: #8ab37a;
    color: var(--black);
  }

  .draggable:focus-visible {
    outline: 3px solid var(--black);
    outline-offset: 4px;
  }

  .draggable:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--black);
  }

  .draggable.dragging {
    cursor: grabbing;
    box-shadow: 10px 10px 0 var(--black);
    z-index: 10;
    transition: none;
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
    opacity: 0.85;
  }

  .description {
    font-family: var(--font-body);
    font-size: 0.72rem;
    line-height: 1.15;
    opacity: 0.75;
    margin-top: 0.1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .draggable {
      transition: none;
    }
  }
</style>
