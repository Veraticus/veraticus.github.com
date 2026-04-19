import type { Meta, StoryObj } from '@storybook/svelte';
import AttemptLog from './AttemptLog.svelte';

const meta = {
  title: 'Primitives/AttemptLog',
  component: AttemptLog,
} satisfies Meta<AttemptLog>;

export default meta;
type Story = StoryObj<AttemptLog>;

export const Empty: Story = {
  args: { entries: [], emptyMessage: 'No attempts yet.' },
};

export const WithEntries: Story = {
  args: {
    entries: [
      {
        id: '1',
        label: 'all four blocks',
        result: 'overflow',
        text: 'OOM: Worker terminated (memory 141/128 MB)',
      },
      {
        id: '2',
        label: 'skip UI',
        result: 'fit',
        text: 'fits headless (this is what pob-server does)',
      },
      {
        id: '3',
        label: 'skip calc temps',
        result: 'error',
        text: 'calc() hung: no workspace allocated',
      },
      {
        id: '4',
        label: 'skip uniques',
        result: 'error',
        text: "Classes/PassiveTree.lua:721: attempt to call global 'buildTreeDependentUniques' (a nil value)",
      },
      {
        id: '5',
        label: 'skip mod tables',
        result: 'silent',
        text: 'runs. DPS: 48.   ← !',
      },
    ],
  },
};
