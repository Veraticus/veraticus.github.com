<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import InteractiveFrame from '../primitives/InteractiveFrame.svelte';
  import Draggable from '../primitives/Draggable.svelte';
  import DropTarget from '../primitives/DropTarget.svelte';
  import Toggle from '../primitives/Toggle.svelte';
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
    storageKey = 'veraticus:pack-the-worker:v1',
  }: Props = $props();

  const ALL_IDS: BlockId[] = POB_BLOCKS.map((b) => b.id);
  const byId = (id: string): PobBlock => POB_BLOCKS.find((b) => b.id === id)!;

  interface SavedState {
    placedOrder?: string[];
    paletteOrder?: string[];
    buildLoaded?: boolean;
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
    buildLoaded: boolean;
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
        buildLoaded: false,
        seenKinds: new Set(),
      };
    }
    const seenKinds = new Set<OutcomeKind>(
      validSeenKinds(saved.seenKinds) ? saved.seenKinds : [],
    );
    return {
      placedOrder,
      paletteOrder,
      buildLoaded: typeof saved.buildLoaded === 'boolean' ? saved.buildLoaded : false,
      seenKinds,
    };
  }

  const initial = hydrated();
  let placedOrder = $state<BlockId[]>(initial.placedOrder);
  let paletteOrder = $state<BlockId[]>(initial.paletteOrder);
  let buildLoaded = $state<boolean>(initial.buildLoaded);
  let seenKinds = $state<Set<OutcomeKind>>(initial.seenKinds);

  $effect(() => {
    saveJSON(storageKey, {
      placedOrder,
      paletteOrder,
      buildLoaded,
      seenKinds: [...seenKinds],
    });
  });

  const placedBlocks = $derived(placedOrder.map(byId));
  const paletteBlocks = $derived(paletteOrder.map(byId));
  const usedSize = $derived(placedBlocks.reduce((s, b) => s + b.size, 0));

  const outcome = $derived<Outcome>(
    evaluateConfig({ placedIds: placedOrder, buildLoaded }),
  );

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
    buildLoaded = false;
    seenKinds = new Set();
  }
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <div class="controls">
      <Toggle
        checked={buildLoaded}
        label="Load a build (+22 MB)"
        ontoggle={(next) => (buildLoaded = next)}
      />
      <ResetButton onreset={handleReset} />
    </div>

    <div class="palette-label">Palette</div>
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
      label="Cloudflare Worker"
      used={usedSize + (buildLoaded ? 22 : 0)}
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

    <div class="outcome-row">
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

    <FailureCatalog seenKinds={seenKinds} />
  {/snippet}
</InteractiveFrame>

<style>
  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .palette-label {
    font-family: var(--font-mono, monospace);
    font-size: var(--text-xs, 0.75rem);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--black);
    opacity: 0.55;
    margin-bottom: 0.35rem;
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

  .outcome-row {
    margin: 1rem 0;
  }
</style>
