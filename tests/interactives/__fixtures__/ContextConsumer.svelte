<script lang="ts">
  import { useInteractiveFrame } from '../../../src/lib/interactives/primitives/InteractiveFrame.context';

  const frame = useInteractiveFrame();
</script>

<button type="button" onclick={() => frame.announce('hello')}>announce</button>
<span data-testid="reduced-motion">{frame.prefersReducedMotion ? 'reduced' : 'full'}</span>
