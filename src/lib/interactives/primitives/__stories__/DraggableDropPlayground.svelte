<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import InteractiveFrame from '../InteractiveFrame.svelte';
  import Draggable from '../Draggable.svelte';
  import DropTarget from '../DropTarget.svelte';
  import { hitTest, type Position } from '../pointer';

  interface Block {
    id: string;
    label: string;
    size: number;
    color: 'teal' | 'coral' | 'yellow' | 'purple';
    placed: boolean;
  }

  interface Props {
    title?: string;
    initialPlaced?: string[];
  }
  let { title = 'Draggable + DropTarget', initialPlaced = [] }: Props = $props();

  let blocks = $state<Block[]>([
    { id: 'mods', label: 'Mod tables', size: 41, color: 'teal', placed: initialPlaced.includes('mods') },
    { id: 'uniques', label: 'Uniques', size: 46, color: 'coral', placed: initialPlaced.includes('uniques') },
    { id: 'ui', label: 'UI + class defs', size: 26, color: 'yellow', placed: initialPlaced.includes('ui') },
    { id: 'calc', label: 'Calc temps', size: 28, color: 'purple', placed: initialPlaced.includes('calc') },
  ]);

  const used = $derived(blocks.filter((b) => b.placed).reduce((s, b) => s + b.size, 0));
  const palette = $derived(blocks.filter((b) => !b.placed));
  const inTarget = $derived(blocks.filter((b) => b.placed));

  let dropEl: HTMLElement | null = $state(null);

  function toggle(id: string) {
    const block = blocks.find((b) => b.id === id);
    if (block) block.placed = !block.placed;
  }

  function onDragEnd(id: string, pos: Position) {
    if (!dropEl) return;
    const rect = dropEl.getBoundingClientRect();
    const over = hitTest(pos, rect);
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    if (over && !block.placed) toggle(id);
    else if (!over && block.placed) toggle(id);
  }
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <div class="palette">
      {#each palette as b (b.id)}
        <span animate:flip={{ duration: 240 }} in:fly={{ y: -20, duration: 240 }}>
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
          <span animate:flip={{ duration: 240 }} in:fly={{ y: -40, duration: 320 }}>
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
</style>
