import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Toggle from '../../src/lib/interactives/primitives/Toggle.svelte';

describe('Toggle', () => {
  it('renders a button with role=switch and the label', () => {
    const { getByRole } = render(Toggle, {
      checked: false,
      label: 'Load a build',
      ontoggle: () => {},
    });
    const btn = getByRole('switch', { name: /Load a build/ });
    expect(btn).not.toBeNull();
  });

  it('reflects checked via aria-checked', () => {
    const { getByRole, rerender } = render(Toggle, {
      checked: false,
      label: 'x',
      ontoggle: () => {},
    });
    expect(getByRole('switch').getAttribute('aria-checked')).toBe('false');
    rerender({ checked: true, label: 'x', ontoggle: () => {} });
    expect(getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('fires ontoggle(next) with the NEW value on click', async () => {
    const calls: boolean[] = [];
    const { getByRole } = render(Toggle, {
      checked: false,
      label: 'x',
      ontoggle: (next: boolean) => calls.push(next),
    });
    await fireEvent.click(getByRole('switch'));
    expect(calls).toEqual([true]);
  });

  it('clicking a checked toggle fires ontoggle(false)', async () => {
    const calls: boolean[] = [];
    const { getByRole } = render(Toggle, {
      checked: true,
      label: 'x',
      ontoggle: (next: boolean) => calls.push(next),
    });
    await fireEvent.click(getByRole('switch'));
    expect(calls).toEqual([false]);
  });
});
