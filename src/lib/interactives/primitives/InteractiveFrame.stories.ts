import type { Meta, StoryObj } from '@storybook/svelte';
import InteractiveFrame from './InteractiveFrame.svelte';

const meta: Meta<typeof InteractiveFrame> = {
  title: 'Primitives/InteractiveFrame',
  component: InteractiveFrame,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'Hello Storybook' },
};

export const LongTitle: Story = {
  args: { title: 'A longer title to confirm border scales' },
};
