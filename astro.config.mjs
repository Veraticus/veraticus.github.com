// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://joshsymonds.com',
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'tokyo-night',
      wrap: true,
    },
  },
});
