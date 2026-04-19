<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import InteractiveFrame from '../InteractiveFrame.svelte';
  import Draggable from '../Draggable.svelte';
  import DropTarget from '../DropTarget.svelte';
  import { hitTest, type Position } from '../pointer';
  import { computeInsertionIndex } from '../reorder';

  interface Block {
    id: string;
    label: string;
    size: number;
    color: 'teal' | 'coral' | 'yellow' | 'purple';
  }

  interface Props {
    title?: string;
    initialPlaced?: string[];
  }
  let { title = 'Draggable + DropTarget', initialPlaced = [] }: Props = $props();

  const blocks: Block[] = [
    { id: 'mods', label: 'Mod tables', size: 41, color: 'teal' },
    { id: 'uniques', label: 'Uniques', size: 46, color: 'coral' },
    { id: 'ui', label: 'UI + class defs', size: 26, color: 'yellow' },
    { id: 'calc', label: 'Calc temps', size: 28, color: 'purple' },
  ];

  let placedOrder = $state<string[]>([...initialPlaced]);
  let justJittered = $state<string | null>(null);
  let jitterTimer: ReturnType<typeof setTimeout> | null = null;

  const byId = (id: string) => blocks.find((b) => b.id === id)!;
  const inTarget = $derived(placedOrder.map(byId));
  const palette = $derived(blocks.filter((b) => !placedOrder.includes(b.id)));
  const used = $derived(inTarget.reduce((s, b) => s + b.size, 0));

  let dropEl: HTMLElement | null = $state(null);

  function toggle(id: string) {
    if (placedOrder.includes(id)) {
      placedOrder = placedOrder.filter((x) => x !== id);
    } else {
      placedOrder = [...placedOrder, id];
      triggerJitter(id);
    }
  }

  function triggerJitter(id: string) {
    justJittered = id;
    if (jitterTimer) clearTimeout(jitterTimer);
    jitterTimer = setTimeout(() => {
      if (justJittered === id) justJittered = null;
    }, 420);
  }

  function onDragEnd(id: string, pos: Position) {
    if (!dropEl) return;
    const rect = dropEl.getBoundingClientRect();
    const over = hitTest(pos, rect);
    const wasPlaced = placedOrder.includes(id);

    if (over) {
      const childRects = Array.from(
        dropEl.querySelectorAll<HTMLElement>('[data-draggable-id]'),
      )
        .filter((el) => el.getAttribute('data-draggable-id') !== id)
        .map((el) => el.getBoundingClientRect());
      const insertAt = computeInsertionIndex(pos.x, childRects);
      const next = wasPlaced ? placedOrder.filter((x) => x !== id) : [...placedOrder];
      next.splice(insertAt, 0, id);
      placedOrder = next;
      triggerJitter(id);
    } else if (wasPlaced) {
      placedOrder = placedOrder.filter((x) => x !== id);
    }
  }
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <div class="palette">
      {#each palette as b (b.id)}
        <span
          class="slot"
          class:jittering={justJittered === b.id}
          animate:flip={{ duration: 240 }}
          in:fly={{ y: -20, duration: 240 }}
        >
          <Draggable
            id={b.id}
            label={b.label}
            size={b.size}
            color={b.color}
            placed={false}
            ontoggle={toggle}
            ondragend={onDragEnd}
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
            animate:flip={{ duration: 240 }}
            in:fly={{ y: -40, duration: 320 }}
          >
            <Draggable
              id={b.id}
              label={b.label}
              size={b.size}
              color={b.color}
              placed={true}
              ontoggle={toggle}
              ondragend={onDragEnd}
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

  @media (prefers-reduced-motion: reduce) {
    .slot.jittering {
      animation: none;
    }
  }
</style>
