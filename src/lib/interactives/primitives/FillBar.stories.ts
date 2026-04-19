import type { Meta, StoryObj } from '@storybook/svelte';
import FillBar from './FillBar.svelte';

const meta = {
  title: 'Primitives/FillBar',
  component: FillBar,
} satisfies Meta<FillBar>;

export default meta;
type Story = StoryObj<FillBar>;

export const Empty: Story = { args: { value: 0, max: 128, unit: 'MB' } };
export const HalfFull: Story = { args: { value: 67, max: 128, unit: 'MB' } };
export const AtCapacity: Story = { args: { value: 128, max: 128, unit: 'MB' } };
export const Overflowing: Story = { args: { value: 141, max: 128, unit: 'MB' } };
