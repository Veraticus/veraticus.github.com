import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    // Resolve Svelte to the browser entry (not SSR entry) inside jsdom tests.
    // Without this, `render()` from @testing-library/svelte hits Svelte's
    // server-side `mount()` which throws `lifecycle_function_unavailable`.
    conditions: ['browser'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
});
