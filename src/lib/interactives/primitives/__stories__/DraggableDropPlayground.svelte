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

  /** Move the dragged id from one list into the other at `insertAt`, wiggling any blocks that shift. */
  function applyCrossListMove(
    from: 'placed' | 'palette',
    to: 'placed' | 'palette',
    id: string,
    insertAt: number,
  ): void {
    const beforeSource = from === 'placed' ? placedOrder : paletteOrder;
    const beforeTarget = to === 'placed' ? placedOrder : paletteOrder;
    // Remove from source
    const sourceAfter = beforeSource.filter((x) => x !== id);
    if (from === 'placed') placedOrder = sourceAfter;
    else paletteOrder = sourceAfter;
    // Insert into target
    const targetAfter = [
      ...beforeTarget.slice(0, insertAt),
      id,
      ...beforeTarget.slice(insertAt),
    ];
    if (to === 'placed') placedOrder = targetAfter;
    else paletteOrder = targetAfter;
    // Wiggle everyone whose index changed in either list (excluding the dragged block).
    for (const otherId of sourceAfter) {
      if (beforeSource.indexOf(otherId) !== sourceAfter.indexOf(otherId)) {
        triggerWiggle(otherId);
      }
    }
    for (const otherId of targetAfter) {
      if (otherId === id) continue;
      if (beforeTarget.indexOf(otherId) !== targetAfter.indexOf(otherId)) {
        triggerWiggle(otherId);
      }
    }
  }

  function handleLiveMove(id: string, pos: Position) {
    draggingId = id;
    // Hit-test BOTH containers. Whichever the pointer is currently over
    // becomes the target list -- even if different from the block's source
    // list, in which case the block migrates between lists live.
    let targetList: 'placed' | 'palette' | null = null;
    let container: HTMLElement | null = null;
    if (dropEl && hitTest(pos, dropEl.getBoundingClientRect())) {
      container = dropEl;
      targetList = 'placed';
    } else if (paletteEl && hitTest(pos, paletteEl.getBoundingClientRect())) {
      container = paletteEl;
      targetList = 'palette';
    }
    if (!container || !targetList) return;

    const currentList = listForId(id);
    if (!currentList) return;

    const childRects = childRectsIn(container, id);
    const insertAt = computeInsertionIndex(pos.x, childRects);

    if (currentList === targetList) {
      const currentOrder = targetList === 'placed' ? placedOrder : paletteOrder;
      if (currentOrder.indexOf(id) === insertAt) return;
      applySameListReorder(targetList, id, insertAt);
    } else {
      applyCrossListMove(currentList, targetList, id, insertAt);
    }
  }

  function handleDragEnd(id: string, pos: Position) {
    draggingId = null;
    // State is already correct thanks to handleLiveMove (cross-list included).
    // Just celebrate the landing if the drop is inside either container.
    const overTarget = dropEl ? hitTest(pos, dropEl.getBoundingClientRect()) : false;
    const overPalette = paletteEl ? hitTest(pos, paletteEl.getBoundingClientRect()) : false;
    if (overTarget || overPalette) {
      triggerJitter(id);
    }
  }
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <div class="palette" bind:this={paletteEl}>
      {#each palette as b (b.id)}
        <span
          class="slot"
          class:jittering={justJittered === b.id}
          class:wiggled={justWiggled[b.id]}
          animate:flip={{ duration: draggingId === b.id ? 0 : 240 }}
          in:fly={{ y: draggingId === b.id ? 0 : -20, duration: draggingId === b.id ? 0 : 240 }}
        >
          <Draggable
            id={b.id}
            label={b.label}
            size={b.size}
            color={b.color}
            placed={false}
            ontoggle={toggle}
            ondragmove={handleLiveMove}
            ondragend={handleDragEnd}
          />
        </span>
      {/each}
      {#if palette.length === 0}
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
        {#each inTarget as b (b.id)}
          <span
            class="slot"
            class:jittering={justJittered === b.id}
            class:wiggled={justWiggled[b.id]}
            animate:flip={{ duration: draggingId === b.id ? 0 : 240 }}
            in:fly={{ y: draggingId === b.id ? 0 : -40, duration: draggingId === b.id ? 0 : 320 }}
          >
            <Draggable
              id={b.id}
              label={b.label}
              size={b.size}
              color={b.color}
              placed={true}
              ontoggle={toggle}
              ondragmove={handleLiveMove}
              ondragend={handleDragEnd}
            />
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
