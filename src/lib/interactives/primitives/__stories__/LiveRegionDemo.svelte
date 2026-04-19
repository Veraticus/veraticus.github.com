<script lang="ts">
  import InteractiveFrame from '../InteractiveFrame.svelte';
  import AnnounceButton from './AnnounceButton.svelte';

  interface Props {
    title?: string;
  }
  let { title = 'Live region demo' }: Props = $props();
</script>

<InteractiveFrame {title}>
  {#snippet children()}
    <AnnounceButton
      label="Announce 'state updated'"
      message="state updated"
    />
  {/snippet}
</InteractiveFrame>
