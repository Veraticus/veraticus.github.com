import type { Meta, StoryObj } from '@storybook/svelte';
import Toggle from './Toggle.svelte';

const meta = {
  title: 'Primitives/Toggle',
  component: Toggle,
} satisfies Meta<Toggle>;

export default meta;
type Story = StoryObj<Toggle>;

export const Unchecked: Story = {
  args: { checked: false, label: 'Load a build', ontoggle: () => {} },
};

export const Checked: Story = {
  args: { checked: true, label: 'Load a build', ontoggle: () => {} },
};
