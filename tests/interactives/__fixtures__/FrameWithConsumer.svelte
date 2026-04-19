<script lang="ts">
  import InteractiveFrame from '../../../src/lib/interactives/primitives/InteractiveFrame.svelte';
  import ContextConsumer from './ContextConsumer.svelte';
</script>

<InteractiveFrame title="With consumer">
  {#snippet children()}
    <ContextConsumer />
  {/snippet}
</InteractiveFrame>
