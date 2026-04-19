import type { Meta, StoryObj } from '@storybook/svelte';
import PackTheWorker from './PackTheWorker.svelte';

const meta = {
  title: 'Widgets/PackTheWorker',
  component: PackTheWorker,
} satisfies Meta<PackTheWorker>;

export default meta;
type Story = StoryObj<PackTheWorker>;

export const Pristine: Story = {
  name: 'Pristine (no blocks placed → fatal boot)',
  args: {
    title: 'Pack the Worker',
    initialPlaced: [],
    storageKey: 'veraticus:pack-the-worker:story:pristine',
  },
};

export const NearFit: Story = {
  name: 'Mods + Calc (88 MB, fatal: no uniques)',
  args: {
    title: 'Pack the Worker — mods + calc',
    initialPlaced: ['mods', 'calc'],
    storageKey: 'veraticus:pack-the-worker:story:near-fit',
  },
};

export const FitsHeadless: Story = {
  name: 'Strip UI (115 MB, fits)',
  args: {
    title: 'Pack the Worker — headless fits',
    initialPlaced: ['mods', 'uniques', 'calc'],
    storageKey: 'veraticus:pack-the-worker:story:fits',
  },
};

export const SilentCatastrophe: Story = {
  name: 'Skip mod tables (100 MB, DPS: 48)',
  args: {
    title: 'Pack the Worker — silent catastrophe',
    initialPlaced: ['uniques', 'ui', 'calc'],
    storageKey: 'veraticus:pack-the-worker:story:silent',
  },
};

export const OverflowAll: Story = {
  name: 'All four placed (141 MB, OOM)',
  args: {
    title: 'Pack the Worker — overflow',
    initialPlaced: ['mods', 'uniques', 'ui', 'calc'],
    storageKey: 'veraticus:pack-the-worker:story:overflow',
  },
};

export const Stuck: Story = {
  name: 'Skip calc temps (stuck waiting for workspace)',
  args: {
    title: 'Pack the Worker — stuck',
    initialPlaced: ['mods', 'uniques', 'ui'],
    storageKey: 'veraticus:pack-the-worker:story:stuck',
  },
};
