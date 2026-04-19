import type { Meta, StoryObj } from '@storybook/svelte';
import ResetButton from './ResetButton.svelte';

const meta = {
  title: 'Primitives/ResetButton',
  component: ResetButton,
} satisfies Meta<ResetButton>;

export default meta;
type Story = StoryObj<ResetButton>;

export const Default: Story = {
  args: { onreset: () => {} },
};

export const CustomLabel: Story = {
  args: { onreset: () => {}, label: 'Start over' },
};
