<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import InteractiveFrame from '../primitives/InteractiveFrame.svelte';
  import Draggable from '../primitives/Draggable.svelte';
  import DropTarget from '../primitives/DropTarget.svelte';
  import ResetButton from '../primitives/ResetButton.svelte';
  import FailureCatalog from './FailureCatalog.svelte';
  import { hitTest, type Position } from '../primitives/pointer';
  import { computeInsertionIndex } from '../primitives/reorder';
  import { loadJSON, saveJSON } from '../primitives/persist';
  import {
    POB_BLOCKS,
    CAPACITY_MB,
    type BlockId,
    type PobBlock,
  } from './pob-errors';
  import { evaluateConfig, type Outcome, type OutcomeKind } from './evaluate';
  import OutcomeOOM from './outcomes/OutcomeOOM.svelte';
  import OutcomeFatal from './outcomes/OutcomeFatal.svelte';
  import OutcomeStuck from './outcomes/OutcomeStuck.svelte';
  import OutcomeSilent from './outcomes/OutcomeSilent.svelte';
  import OutcomeFit from './outcomes/OutcomeFit.svelte';

  interface Props {
    title?: string;
    initialPlaced?: BlockId[];
    storageKey?: string;
  }
  let {
    title = 'Pack the Worker',
    initialPlaced = [],
    storageKey = 'veraticus:pack-the-worker:v2',
  }: Props = $props();

  const ALL_IDS: BlockId[] = POB_BLOCKS.map((b) => b.id);
  const byId = (id: string): PobBlock => POB_BLOCKS.find((b) => b.id === id)!;

  interface SavedState {
    placedOrder?: string[];
    paletteOrder?: string[];
    seenKinds?: OutcomeKind[];
  }

  const ALL_KINDS: OutcomeKind[] = ['oom', 'fatal', 'stuck', 'silent', 'fit'];

  function validOrder(order: unknown): order is BlockId[] {
    return (
      Array.isArray(order) &&
      order.every((x) => typeof x === 'string' && ALL_IDS.includes(x as BlockId)) &&
      new Set(order as string[]).size === order.length
    );
  }

  function validSeenKinds(v: unknown): v is OutcomeKind[] {
    return Array.isArray(v) && v.every((k) => typeof k === 'string' && ALL_KINDS.includes(k as OutcomeKind));
  }

  function hydrated(): {
    placedOrder: BlockId[];
    paletteOrder: BlockId[];
    seenKinds: Set<OutcomeKind>;
  } {
    const saved = loadJSON<SavedState>(storageKey, {});
    const placedOrder = validOrder(saved.placedOrder) ? saved.placedOrder : [...initialPlaced];
    const paletteOrder = validOrder(saved.paletteOrder)
      ? saved.paletteOrder
      : ALL_IDS.filter((id) => !placedOrder.includes(id));
    const seen = new Set([...placedOrder, ...paletteOrder]);
    if (seen.size !== ALL_IDS.length || ALL_IDS.some((id) => !seen.has(id))) {
      return {
        placedOrder: [...initialPlaced],
        paletteOrder: ALL_IDS.filter((id) => !initialPlaced.includes(id)),
        seenKinds: new Set(),
      };
    }
    const seenKinds = new Set<OutcomeKind>(
      validSeenKinds(saved.seenKinds) ? saved.seenKinds : [],
    );
    return { placedOrder, paletteOrder, seenKinds };
  }

  const initial = hydrated();
  let placedOrder = $state<BlockId[]>(initial.placedOrder);
  let paletteOrder = $state<BlockId[]>(initial.paletteOrder);
  let seenKinds = $state<Set<OutcomeKind>>(initial.seenKinds);

  $effect(() => {
    saveJSON(storageKey, {
      placedOrder,
      paletteOrder,
      seenKinds: [...seenKinds],
    });
  });

  // Nudge the first palette block while the Worker is empty. Reset brings
  // the nudge back. Any drop into the Worker turns it off for the session.
  const nudgeBlockId = $derived(
    placedOrder.length === 0 && paletteOrder.length > 0 ? paletteOrder[0] : null,
  );

  const placedBlocks = $derived(placedOrder.map(byId));
  const usedSize = $derived(placedBlocks.reduce((s, b) => s + b.size, 0));

  const outcome = $derived<Outcome>(evaluateConfig({ placedIds: placedOrder }));

  $effect(() => {
    if (!seenKinds.has(outcome.kind)) {
      seenKinds = new Set([...seenKinds, outcome.kind]);
    }
  });

  let dropEl: HTMLElement | null = $state(null);
  let paletteEl: HTMLElement | null = $state(null);

  let justJittered = $state<string | null>(null);
  let jitterTimer: ReturnType<typeof setTimeout> | null = null;
  let justWiggled = $state<Record<string, boolean>>({});
  const wiggleTimers = new Map<string, ReturnType<typeof setTimeout>>();
  let draggingId = $state<string | null>(null);

  let phantomPlacedIndex = $state<number | null>(null);
  let phantomPaletteIndex = $state<number | null>(null);
  let dragBlockSize = $state<{ width: number; height: number } | null>(null);

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
    const t = setTimeout(() => {
      justWiggled = { ...justWiggled, [id]: false };
      wiggleTimers.delete(id);
    }, 240);
    wiggleTimers.set(id, t);
  }

  function toggle(id: string) {
    if (placedOrder.includes(id as BlockId)) {
      placedOrder = placedOrder.filter((x) => x !== id);
      paletteOrder = [...paletteOrder, id as BlockId];
    } else {
      paletteOrder = paletteOrder.filter((x) => x !== id);
      placedOrder = [...placedOrder, id as BlockId];
      triggerJitter(id);
    }
  }

  function listForId(id: string): 'placed' | 'palette' | null {
    if (placedOrder.includes(id as BlockId)) return 'placed';
    if (paletteOrder.includes(id as BlockId)) return 'palette';
    return null;
  }

  function childRectsIn(container: HTMLElement, excludeId: string): DOMRect[] {
    return Array.from(container.querySelectorAll<HTMLElement>('[data-draggable-id]'))
      .filter((el) => el.getAttribute('data-draggable-id') !== excludeId)
      .map((el) => el.getBoundingClientRect());
  }

  function applySameListReorder(list: 'placed' | 'palette', id: string, insertAt: number): void {
    const current = list === 'placed' ? placedOrder : paletteOrder;
    const before = current;
    const without = current.filter((x) => x !== id);
    const next = [...without.slice(0, insertAt), id as BlockId, ...without.slice(insertAt)];
    if (list === 'placed') placedOrder = next;
    else paletteOrder = next;
    for (const otherId of next) {
      if (otherId === id) continue;
      if (before.indexOf(otherId) !== next.indexOf(otherId)) {
        triggerWiggle(otherId);
      }
    }
  }

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
      if (currentOrder.indexOf(id as BlockId) !== insertAt) {
        applySameListReorder(currentList, id, insertAt);
      }
      return;
    }

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
    const wasPlaced = placedOrder.includes(id as BlockId);

    if (overTarget && !wasPlaced) {
      const insertAt = phantomPlacedIndex ?? placedOrder.length;
      paletteOrder = paletteOrder.filter((x) => x !== id);
      placedOrder = [
        ...placedOrder.slice(0, insertAt),
        id as BlockId,
        ...placedOrder.slice(insertAt),
      ];
      triggerJitter(id);
    } else if (overPalette && wasPlaced) {
      const insertAt = phantomPaletteIndex ?? paletteOrder.length;
      placedOrder = placedOrder.filter((x) => x !== id);
      paletteOrder = [
        ...paletteOrder.slice(0, insertAt),
        id as BlockId,
        ...paletteOrder.slice(insertAt),
      ];
      triggerJitter(id);
    } else if (overTarget || overPalette) {
      triggerJitter(id);
    }

    draggingId = null;
    phantomPlacedIndex = null;
    phantomPaletteIndex = null;
    dragBlockSize = null;
  }

  type SlotEntry =
    | { kind: 'block'; id: string; block: PobBlock; key: string }
    | { kind: 'phantom'; key: string };

  function makeSlots(order: BlockId[], phantomAt: number | null): SlotEntry[] {
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

  function handleReset() {
    placedOrder = [];
    paletteOrder = [...ALL_IDS];
    seenKinds = new Set();
  }
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <div class="palette-header">
      <span class="palette-label">Path of Building Components</span>
      <ResetButton onreset={handleReset} />
    </div>
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
            {#if nudgeBlockId === slot.block.id}
              <span class="nudge-wrap">
                <!-- Ghost block that "drags" along with the cursor -->
                <span class="phantom-block color-{slot.block.color}" aria-hidden="true">
                  <span class="phantom-label">{slot.block.label}</span>
                  <span class="phantom-size">{slot.block.size} MB</span>
                </span>
                <!-- Cursor: arrow above, fist on grab, open hand on release -->
                <span class="phantom-cursor" aria-hidden="true">
                  <svg class="cursor-arrow" viewBox="0 0 24 28">
                    <path d="M 3 2 L 3 22 L 8 18 L 12 26 L 16 24 L 12 16 L 19 16 Z" />
                  </svg>
                  <svg class="cursor-fist" viewBox="0 0 28 32">
                    <path d="M 6 12 Q 6 6 12 6 L 18 6 Q 24 6 24 12 L 24 22 Q 24 28 18 28 L 12 28 Q 6 28 6 22 Z M 9 10 L 9 14 M 13 10 L 13 14 M 17 10 L 17 14 M 21 10 L 21 14" />
                  </svg>
                  <svg class="cursor-open" viewBox="0 0 28 36">
                    <path d="M 6 18 L 6 10 Q 6 8 8 8 Q 10 8 10 10 L 10 18 L 10 4 Q 10 2 12 2 Q 14 2 14 4 L 14 18 L 14 3 Q 14 1 16 1 Q 18 1 18 3 L 18 18 L 18 6 Q 18 4 20 4 Q 22 4 22 6 L 22 22 Q 22 32 14 32 Q 6 32 6 22 Z" />
                  </svg>
                </span>
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
              </span>
            {:else}
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
          {/if}
        </span>
      {/each}
      {#if paletteSlots.length === 0}
        <p class="empty-palette">All blocks placed.</p>
      {/if}
    </div>

    <DropTarget
      label="Cloudflare Worker"
      used={usedSize}
      capacity={CAPACITY_MB}
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

    <div class="lower-grid">
      <div class="outcome-cell">
        {#if outcome.kind === 'oom'}
          <OutcomeOOM text={outcome.text} />
        {:else if outcome.kind === 'fatal'}
          <OutcomeFatal text={outcome.text} />
        {:else if outcome.kind === 'stuck'}
          <OutcomeStuck text={outcome.text} />
        {:else if outcome.kind === 'silent'}
          <OutcomeSilent
            wrong={outcome.revealRealAnswer!.wrong}
            real={outcome.revealRealAnswer!.real}
          />
        {:else}
          <OutcomeFit text={outcome.text} />
        {/if}
      </div>
      <div class="catalog-cell">
        <FailureCatalog seenKinds={seenKinds} />
      </div>
    </div>
  {/snippet}
</InteractiveFrame>

<style>
  .palette-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.65rem;
  }

  .palette-label {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-xs, 0.75rem);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--black);
    opacity: 0.55;
  }

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

  .nudge-wrap {
    position: relative;
    display: inline-flex;
  }

  .nudge-wrap {
    position: relative;
    display: inline-flex;
  }

  /* Ghost block: dashed outline version of the real block, slides alongside
     the cursor. Sized to match the real Draggable exactly (inset:0 on the
     nudge-wrap, box-sizing: border-box). */
  .phantom-block {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.125rem;
    padding: 0.75rem 1rem;
    border: 3px dashed var(--black);
    box-sizing: border-box;
    color: var(--black);
    font-family: var(--font-body);
    font-size: var(--text-base, 1rem);
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    animation: phantom-block-demo 3.6s ease-in-out infinite;
  }
  .phantom-block.color-teal { background: rgba(46, 196, 182, 0.55); }
  .phantom-block.color-coral { background: rgba(255, 107, 107, 0.55); }
  .phantom-block.color-yellow { background: rgba(255, 209, 102, 0.55); }
  .phantom-block.color-purple { background: rgba(124, 92, 255, 0.55); color: var(--bg); }
  .phantom-block.color-green { background: rgba(138, 179, 122, 0.55); }
  .phantom-label { font-weight: 600; }
  .phantom-size {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.8;
  }

  /* Cursor container: travels along the same path as the phantom block, but
     with a vertical offset so the tip sits at the top of the block. Each
     cursor variant fades in at its own phase. */
  .phantom-cursor {
    position: absolute;
    top: 0;
    left: 50%;
    pointer-events: none;
    z-index: 3;
    opacity: 0;
    animation: phantom-cursor-travel 3.6s ease-in-out infinite;
  }
  .phantom-cursor svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 26px;
    height: auto;
    opacity: 0;
  }
  .phantom-cursor svg path {
    fill: rgba(255, 255, 255, 0.92);
    stroke: var(--black);
    stroke-width: 2;
    stroke-dasharray: 3 2;
    stroke-linejoin: round;
  }
  .cursor-arrow { animation: phantom-cursor-arrow 3.6s ease-in-out infinite; }
  .cursor-fist { animation: phantom-cursor-fist 3.6s ease-in-out infinite; }
  .cursor-open { animation: phantom-cursor-open 3.6s ease-in-out infinite; }

  /* Travel path (cursor): start above, press down onto block, drag to worker. */
  @keyframes phantom-cursor-travel {
    0%, 100% { transform: translate(-50%, -44px); opacity: 0; }
    8%       { transform: translate(-50%, -44px); opacity: 1; }
    24%      { transform: translate(-50%, -6px);  opacity: 1; }
    70%      { transform: translate(-50%, 150px); opacity: 1; }
    85%      { transform: translate(-50%, 150px); opacity: 0; }
  }

  /* Ghost block only appears during the grab-and-drag phase. */
  @keyframes phantom-block-demo {
    0%, 22%, 100% { transform: translate(0, 0); opacity: 0; }
    28%           { transform: translate(0, 0); opacity: 0.8; }
    70%           { transform: translate(0, 148px); opacity: 0.8; }
    82%           { transform: translate(0, 148px); opacity: 0; }
  }

  /* Arrow visible only during approach (before grab). */
  @keyframes phantom-cursor-arrow {
    0%, 26%, 100% { opacity: 1; }
    27%, 99%      { opacity: 0; }
  }
  /* Closed fist during the drag portion. */
  @keyframes phantom-cursor-fist {
    0%, 27%, 72%, 100% { opacity: 0; }
    28%, 70%           { opacity: 1; }
  }
  /* Open hand briefly on release. */
  @keyframes phantom-cursor-open {
    0%, 71%, 86%, 100% { opacity: 0; }
    73%, 82%           { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .phantom-cursor,
    .phantom-cursor svg,
    .phantom-block {
      animation: none;
    }
    .phantom-cursor { opacity: 1; transform: translate(-50%, 40px); }
    .cursor-fist { opacity: 1; }
    .phantom-block { opacity: 0.7; transform: translate(0, 40px); }
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
    0% {
      transform: translate(0, -8px) rotate(-4deg);
    }
    25% {
      transform: translate(3px, 1px) rotate(3deg);
    }
    50% {
      transform: translate(-2px, -2px) rotate(-2deg);
    }
    75% {
      transform: translate(1px, 1px) rotate(1deg);
    }
    100% {
      transform: translate(0, 0) rotate(0);
    }
  }

  @keyframes wiggle {
    0%, 100% { transform: translate(0, 0) rotate(0); }
    50% { transform: translate(0, -2px) rotate(-1.5deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .slot.jittering,
    .slot.wiggled {
      animation: none;
    }
  }

  .lower-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  @media (min-width: 620px) {
    .lower-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .outcome-cell,
  .catalog-cell {
    min-width: 0;
  }
</style>
