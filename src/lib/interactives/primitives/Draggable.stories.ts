import type { Meta, StoryObj } from '@storybook/svelte';
import Draggable from './Draggable.svelte';
import DraggableDropPlayground from './__stories__/DraggableDropPlayground.svelte';

const meta = {
  title: 'Primitives/Draggable',
  component: Draggable,
} satisfies Meta<Draggable>;

export default meta;
type Story = StoryObj<Draggable>;

export const Unplaced: Story = {
  args: {
    id: 'mods',
    label: 'Mod tables',
    size: 41,
    placed: false,
    color: 'teal',
    ontoggle: () => {},
  },
};

export const Placed: Story = {
  args: {
    id: 'mods',
    label: 'Mod tables',
    size: 41,
    placed: true,
    color: 'teal',
    ontoggle: () => {},
  },
};

export const Coral: Story = {
  args: {
    id: 'uniques',
    label: 'Uniques',
    size: 46,
    placed: false,
    color: 'coral',
    ontoggle: () => {},
  },
};

export const Purple: Story = {
  args: {
    id: 'calc',
    label: 'Calc temps',
    size: 28,
    placed: false,
    color: 'purple',
    ontoggle: () => {},
  },
};

type PlaygroundStory = StoryObj<typeof DraggableDropPlayground>;

export const PlaygroundEmpty: PlaygroundStory = {
  name: 'Playground: all unplaced',
  render: (args) => ({ Component: DraggableDropPlayground, props: args }),
  args: {
    title: 'All unplaced (palette full)',
    initialPlaced: [],
    storageKey: 'veraticus:playground:story:empty',
  },
};

export const PlaygroundPartial: PlaygroundStory = {
  name: 'Playground: two placed, under capacity',
  render: (args) => ({ Component: DraggableDropPlayground, props: args }),
  args: {
    title: 'Two placed: 41 + 26 = 67 / 128',
    initialPlaced: ['mods', 'ui'],
    storageKey: 'veraticus:playground:story:partial',
  },
};

export const PlaygroundOverflowing: PlaygroundStory = {
  name: 'Playground: all placed, overflowing',
  render: (args) => ({ Component: DraggableDropPlayground, props: args }),
  args: {
    title: 'All placed: 141 / 128 (overflow)',
    initialPlaced: ['mods', 'uniques', 'ui', 'calc'],
    storageKey: 'veraticus:playground:story:overflow',
  },
};
