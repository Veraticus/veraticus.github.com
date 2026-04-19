<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import InteractiveFrame from '../InteractiveFrame.svelte';
  import Draggable from '../Draggable.svelte';
  import DropTarget from '../DropTarget.svelte';
  import { hitTest, type Position } from '../pointer';
  import { computeInsertionIndex } from '../reorder';
  import { loadJSON, saveJSON } from '../persist';

  interface Block {
    id: string;
    label: string;
    size: number;
    color: 'teal' | 'coral' | 'yellow' | 'purple';
  }

  interface Props {
    title?: string;
    initialPlaced?: string[];
    storageKey?: string;
  }
  let {
    title = 'Draggable + DropTarget',
    initialPlaced = [],
    storageKey = 'veraticus:playground:v1',
  }: Props = $props();

  const blocks: Block[] = [
    { id: 'mods', label: 'Mod tables', size: 41, color: 'teal' },
    { id: 'uniques', label: 'Uniques', size: 46, color: 'coral' },
    { id: 'ui', label: 'UI + class defs', size: 26, color: 'yellow' },
    { id: 'calc', label: 'Calc temps', size: 28, color: 'purple' },
  ];
  const ALL_IDS = blocks.map((b) => b.id);
  const byId = (id: string) => blocks.find((b) => b.id === id)!;

  interface SavedState {
    placedOrder?: string[];
    paletteOrder?: string[];
  }

  function validOrder(order: unknown): order is string[] {
    return (
      Array.isArray(order) &&
      order.every((x) => typeof x === 'string' && ALL_IDS.includes(x)) &&
      new Set(order).size === order.length
    );
  }

  function hydratedOrders(): { placedOrder: string[]; paletteOrder: string[] } {
    const saved = loadJSON<SavedState>(storageKey, {});
    const placedOrder = validOrder(saved.placedOrder) ? saved.placedOrder : [...initialPlaced];
    const paletteOrder = validOrder(saved.paletteOrder)
      ? saved.paletteOrder
      : ALL_IDS.filter((id) => !placedOrder.includes(id));
    // Final integrity: every id appears exactly once across the two lists.
    const seen = new Set([...placedOrder, ...paletteOrder]);
    if (seen.size !== ALL_IDS.length || ALL_IDS.some((id) => !seen.has(id))) {
      return {
        placedOrder: [...initialPlaced],
        paletteOrder: ALL_IDS.filter((id) => !initialPlaced.includes(id)),
      };
    }
    return { placedOrder, paletteOrder };
  }

  const initial = hydratedOrders();
  let placedOrder = $state<string[]>(initial.placedOrder);
  let paletteOrder = $state<string[]>(initial.paletteOrder);

  $effect(() => {
    saveJSON(storageKey, { placedOrder, paletteOrder });
  });

  const inTarget = $derived(placedOrder.map(byId));
  const palette = $derived(paletteOrder.map(byId));
  const used = $derived(inTarget.reduce((s, b) => s + b.size, 0));

  let dropEl: HTMLElement | null = $state(null);
  let paletteEl: HTMLElement | null = $state(null);

  let justJittered = $state<string | null>(null);
  let jitterTimer: ReturnType<typeof setTimeout> | null = null;

  let justWiggled = $state<Record<string, boolean>>({});
  const wiggleTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Id of the block currently being dragged past the threshold, if any.
   * Used to short-circuit animate:flip on THAT block so its flip-invert
   * transform doesn't fight Draggable's pointer-tracking transform when
   * live reorder moves the block to a new DOM slot.
   */
  let draggingId = $state<string | null>(null);

  function triggerJitter(id: string) {
    justJittered = id;
    if (jitterTimer) clearTimeout(jitterTimer);
    jitterTimer = setTimeout(() => {
      if (justJittered === id) justJittered = null;
    }, 420);
  }

  function triggerWiggle(id: string) {
    justWiggled = { ...justWiggled, [id]: true };
    const existing = wiggleTimers.get(id);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      justWiggled = { ...justWiggled, [id]: false };
      wiggleTimers.delete(id);
    }, 240);
    wiggleTimers.set(id, timer);
  }

  function toggle(id: string) {
    if (placedOrder.includes(id)) {
      placedOrder = placedOrder.filter((x) => x !== id);
      paletteOrder = [...paletteOrder, id];
    } else {
      paletteOrder = paletteOrder.filter((x) => x !== id);
      placedOrder = [...placedOrder, id];
      triggerJitter(id);
    }
  }

  function listForId(id: string): 'placed' | 'palette' | null {
    if (placedOrder.includes(id)) return 'placed';
    if (paletteOrder.includes(id)) return 'palette';
    return null;
  }

  function childRectsIn(container: HTMLElement, excludeId: string): DOMRect[] {
    return Array.from(container.querySelectorAll<HTMLElement>('[data-draggable-id]'))
      .filter((el) => el.getAttribute('data-draggable-id') !== excludeId)
      .map((el) => el.getBoundingClientRect());
  }

  /** Apply a same-list reorder and wiggle any id whose position shifted. */
  function applySameListReorder(list: 'placed' | 'palette', id: string, insertAt: number): void {
    const current = list === 'placed' ? placedOrder : paletteOrder;
    const before = current;
    const without = current.filter((x) => x !== id);
    const next = [...without.slice(0, insertAt), id, ...without.slice(insertAt)];
    if (list === 'placed') placedOrder = next;
    else paletteOrder = next;
    // Any block whose index changed and isn't the one being dragged: wiggle.
    for (const otherId of next) {
      if (otherId === id) continue;
      if (before.indexOf(otherId) !== next.indexOf(otherId)) {
        triggerWiggle(otherId);
      }
    }
  }

  /**
   * When the pointer is hovering over the list the dragged block is NOT in,
   * we show a phantom placeholder there at the would-be insertion index so
   * the destination blocks shift and signal "this is where it'll go." The
   * block's actual DOM stays in its source list throughout the drag -- if
   * we moved it between {#each} blocks mid-drag Svelte would remount the
   * Draggable, killing the pointer capture and stopping the drag.
   */
  let phantomPlacedIndex = $state<number | null>(null);
  let phantomPaletteIndex = $state<number | null>(null);
  let dragBlockSize = $state<{ width: number; height: number } | null>(null);

  function maybeCaptureDragSize(id: string) {
    if (dragBlockSize) return;
    const el = document.querySelector<HTMLElement>(`[data-draggable-id="${id}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragBlockSize = { width: rect.width, height: rect.height };
  }

  function wigglePhantomShift(
    list: 'placed' | 'palette',
    prevIdx: number | null,
    nextIdx: number | null,
  ) {
    if (prevIdx === nextIdx) return;
    const order = list === 'placed' ? placedOrder : paletteOrder;
    const lo = Math.min(prevIdx ?? order.length, nextIdx ?? order.length);
    for (let i = lo; i < order.length; i++) {
      triggerWiggle(order[i]);
    }
  }

  function handleLiveMove(id: string, pos: Position) {
    draggingId = id;
    maybeCaptureDragSize(id);

    const currentList = listForId(id);
    if (!currentList) return;

    const sourceContainer = currentList === 'placed' ? dropEl : paletteEl;
    const destContainer = currentList === 'placed' ? paletteEl : dropEl;
    const destListName: 'placed' | 'palette' = currentList === 'placed' ? 'palette' : 'placed';

    // Over the OTHER list → show a phantom there; source stays static
    if (destContainer && hitTest(pos, destContainer.getBoundingClientRect())) {
      const rects = childRectsIn(destContainer, id);
      const insertAt = computeInsertionIndex(pos.x, rects);
      if (destListName === 'placed') {
        wigglePhantomShift('placed', phantomPlacedIndex, insertAt);
        phantomPlacedIndex = insertAt;
        phantomPaletteIndex = null;
      } else {
        wigglePhantomShift('palette', phantomPaletteIndex, insertAt);
        phantomPaletteIndex = insertAt;
        phantomPlacedIndex = null;
      }
      return;
    }

    // Over the source list → clear any phantom, run same-list reorder
    if (sourceContainer && hitTest(pos, sourceContainer.getBoundingClientRect())) {
      if (phantomPlacedIndex !== null) {
        wigglePhantomShift('placed', phantomPlacedIndex, null);
        phantomPlacedIndex = null;
      }
      if (phantomPaletteIndex !== null) {
        wigglePhantomShift('palette', phantomPaletteIndex, null);
        phantomPaletteIndex = null;
      }
      const childRects = childRectsIn(sourceContainer, id);
      const insertAt = computeInsertionIndex(pos.x, childRects);
      const currentOrder = currentList === 'placed' ? placedOrder : paletteOrder;
      if (currentOrder.indexOf(id) !== insertAt) {
        applySameListReorder(currentList, id, insertAt);
      }
      return;
    }

    // Over neither → clear phantom, leave source untouched
    if (phantomPlacedIndex !== null) {
      wigglePhantomShift('placed', phantomPlacedIndex, null);
      phantomPlacedIndex = null;
    }
    if (phantomPaletteIndex !== null) {
      wigglePhantomShift('palette', phantomPaletteIndex, null);
      phantomPaletteIndex = null;
    }
  }

  function handleDragEnd(id: string, pos: Position) {
    const overTarget = dropEl ? hitTest(pos, dropEl.getBoundingClientRect()) : false;
    const overPalette = paletteEl ? hitTest(pos, paletteEl.getBoundingClientRect()) : false;
    const wasPlaced = placedOrder.includes(id);

    // Cross-list commit: pointer released on the OTHER list. Use the phantom
    // index we've been maintaining as the insertion slot.
    if (overTarget && !wasPlaced) {
      const insertAt = phantomPlacedIndex ?? placedOrder.length;
      paletteOrder = paletteOrder.filter((x) => x !== id);
      placedOrder = [
        ...placedOrder.slice(0, insertAt),
        id,
        ...placedOrder.slice(insertAt),
      ];
      triggerJitter(id);
    } else if (overPalette && wasPlaced) {
      const insertAt = phantomPaletteIndex ?? paletteOrder.length;
      placedOrder = placedOrder.filter((x) => x !== id);
      paletteOrder = [
        ...paletteOrder.slice(0, insertAt),
        id,
        ...paletteOrder.slice(insertAt),
      ];
      triggerJitter(id);
    } else if (overTarget || overPalette) {
      // Dropped in source list (same-list reorder already applied live)
      triggerJitter(id);
    }
    // Else: released outside both; leave state alone, block snaps back visually

    draggingId = null;
    phantomPlacedIndex = null;
    phantomPaletteIndex = null;
    dragBlockSize = null;
  }

  /**
   * Helpers to render a list with an optional phantom inserted at a given index.
   * Keyed by a stable string so Svelte reconciliation works with flip/transitions.
   */
  type SlotEntry =
    | { kind: 'block'; id: string; block: Block; key: string }
    | { kind: 'phantom'; key: string };

  function makeSlots(order: string[], phantomAt: number | null): SlotEntry[] {
    const slots: SlotEntry[] = order.map((id) => ({
      kind: 'block' as const,
      id,
      block: byId(id),
      key: id,
    }));
    if (phantomAt !== null) {
      const insertAt = Math.min(phantomAt, slots.length);
      slots.splice(insertAt, 0, { kind: 'phantom', key: '__phantom__' });
    }
    return slots;
  }

  const paletteSlots = $derived(makeSlots(paletteOrder, phantomPaletteIndex));
  const placedSlots = $derived(makeSlots(placedOrder, phantomPlacedIndex));
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <div class="palette" bind:this={paletteEl}>
      {#each paletteSlots as slot (slot.key)}
        <span
          class:slot={slot.kind === 'block'}
          class:phantom={slot.kind === 'phantom'}
          class:jittering={slot.kind === 'block' && justJittered === slot.id}
          class:wiggled={slot.kind === 'block' && !!justWiggled[slot.id]}
          style:width={slot.kind === 'phantom' ? `${dragBlockSize?.width ?? 140}px` : null}
          style:height={slot.kind === 'phantom' ? `${dragBlockSize?.height ?? 64}px` : null}
          animate:flip={{ duration: slot.kind === 'block' && draggingId === slot.id ? 0 : 240 }}
          in:fly={{
            y: slot.kind === 'block' && draggingId !== slot.id ? -20 : 0,
            duration: slot.kind === 'block' && draggingId !== slot.id ? 240 : 0,
          }}
        >
          {#if slot.kind === 'block'}
            <Draggable
              id={slot.block.id}
              label={slot.block.label}
              size={slot.block.size}
              color={slot.block.color}
              placed={false}
              ontoggle={toggle}
              ondragmove={handleLiveMove}
              ondragend={handleDragEnd}
            />
          {/if}
        </span>
      {/each}
      {#if paletteSlots.length === 0}
        <p class="empty-palette">All blocks placed.</p>
      {/if}
    </div>

    <DropTarget
      label="Worker"
      {used}
      capacity={128}
      onmount={(el) => (dropEl = el)}
    >
      {#snippet children()}
        {#each placedSlots as slot (slot.key)}
          <span
            class:slot={slot.kind === 'block'}
            class:phantom={slot.kind === 'phantom'}
            class:jittering={slot.kind === 'block' && justJittered === slot.id}
            class:wiggled={slot.kind === 'block' && !!justWiggled[slot.id]}
            style:width={slot.kind === 'phantom' ? `${dragBlockSize?.width ?? 140}px` : null}
            style:height={slot.kind === 'phantom' ? `${dragBlockSize?.height ?? 64}px` : null}
            animate:flip={{ duration: slot.kind === 'block' && draggingId === slot.id ? 0 : 240 }}
            in:fly={{
              y: slot.kind === 'block' && draggingId !== slot.id ? -40 : 0,
              duration: slot.kind === 'block' && draggingId !== slot.id ? 320 : 0,
            }}
          >
            {#if slot.kind === 'block'}
              <Draggable
                id={slot.block.id}
                label={slot.block.label}
                size={slot.block.size}
                color={slot.block.color}
                placed={true}
                ontoggle={toggle}
                ondragmove={handleLiveMove}
                ondragend={handleDragEnd}
              />
            {/if}
          </span>
        {/each}
      {/snippet}
    </DropTarget>
  {/snippet}
</InteractiveFrame>

<style>
  .palette {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 3px dashed var(--black);
    min-height: 5rem;
  }

  .empty-palette {
    margin: 0;
    color: var(--black);
    opacity: 0.6;
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
  }

  .slot {
    display: inline-flex;
  }

  .phantom {
    display: inline-block;
    border: 3px dashed var(--black);
    background: transparent;
    box-sizing: border-box;
    opacity: 0.5;
    pointer-events: none;
  }

  .slot.jittering {
    animation: jitter 420ms ease-out 1;
    transform-origin: center;
  }

  .slot.wiggled {
    animation: wiggle 240ms ease-out 1;
    transform-origin: center;
  }

  @keyframes jitter {
    0%   { transform: translate(0, -8px) rotate(-4deg); }
    25%  { transform: translate(3px, 1px) rotate(3deg); }
    50%  { transform: translate(-2px, -2px) rotate(-2deg); }
    75%  { transform: translate(1px, 1px) rotate(1deg); }
    100% { transform: translate(0, 0) rotate(0); }
  }

  @keyframes wiggle {
    0%   { transform: translate(0, 0) rotate(0); }
    50%  { transform: translate(0, -2px) rotate(-1.5deg); }
    100% { transform: translate(0, 0) rotate(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .slot.jittering,
    .slot.wiggled {
      animation: none;
    }
  }
</style>
