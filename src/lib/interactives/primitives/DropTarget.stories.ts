import type { Meta, StoryObj } from '@storybook/svelte';
import DropTarget from './DropTarget.svelte';

const meta = {
  title: 'Primitives/DropTarget',
  component: DropTarget,
} satisfies Meta<DropTarget>;

export default meta;
type Story = StoryObj<DropTarget>;

export const Empty: Story = {
  args: { label: 'Worker', used: 0, capacity: 128 },
};

export const HalfFull: Story = {
  args: { label: 'Worker', used: 67, capacity: 128 },
};

export const AtCapacity: Story = {
  args: { label: 'Worker', used: 128, capacity: 128 },
};

export const Overflowing: Story = {
  args: { label: 'Worker', used: 141, capacity: 128 },
};
