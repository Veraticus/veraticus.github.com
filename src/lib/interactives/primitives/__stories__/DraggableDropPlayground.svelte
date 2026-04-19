<script lang="ts">
  import InteractiveFrame from '../InteractiveFrame.svelte';
  import Draggable from '../Draggable.svelte';
  import DropTarget from '../DropTarget.svelte';

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

  function toggle(id: string) {
    const block = blocks.find((b) => b.id === id);
    if (block) block.placed = !block.placed;
  }
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <div class="palette">
      {#each blocks.filter((b) => !b.placed) as b (b.id)}
        <Draggable
          id={b.id}
          label={b.label}
          size={b.size}
          color={b.color}
          placed={false}
          ontoggle={toggle}
        />
      {/each}
      {#if blocks.every((b) => b.placed)}
        <p class="empty-palette">All blocks placed.</p>
      {/if}
    </div>

    <DropTarget label="Worker" {used} capacity={128}>
      {#snippet children()}
        {#each blocks.filter((b) => b.placed) as b (b.id)}
          <Draggable
            id={b.id}
            label={b.label}
            size={b.size}
            color={b.color}
            placed={true}
            ontoggle={toggle}
          />
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
