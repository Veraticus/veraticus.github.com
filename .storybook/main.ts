import type { StorybookConfig } from '@storybook/svelte-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const config: StorybookConfig = {
  stories: ['../src/lib/interactives/**/*.stories.@(ts|js)'],
  addons: [],
  framework: {
    name: '@storybook/svelte-vite',
    options: {
      docgen: false,
    },
  },
  async viteFinal(config) {
    config.plugins = config.plugins ?? [];
    config.plugins.push(svelte({ hot: false }));
    return config;
  },
};

export default config;
