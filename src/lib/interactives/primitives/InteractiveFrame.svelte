<script lang="ts">
  interface Props {
    title?: string;
    children?: import('svelte').Snippet;
  }

  let { title = 'Interactive', children }: Props = $props();
</script>

<section class="interactive-frame" aria-label={title}>
  <h3>{title}</h3>
  {@render children?.()}
</section>

<style>
  .interactive-frame {
    border: 3px solid var(--black);
    padding: 1rem;
    background: var(--bg);
    box-shadow: 4px 4px 0 var(--black);
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-family: var(--font-heading, var(--font-body));
  }
</style>
