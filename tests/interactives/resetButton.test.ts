import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ResetButton from '../../src/lib/interactives/primitives/ResetButton.svelte';

describe('ResetButton', () => {
  it('renders a button named "Reset" by default', () => {
    const { getByRole } = render(ResetButton, { onreset: () => {} });
    expect(getByRole('button', { name: /Reset/ })).not.toBeNull();
  });

  it('uses a custom label when provided', () => {
    const { getByRole } = render(ResetButton, {
      onreset: () => {},
      label: 'Start over',
    });
    expect(getByRole('button', { name: /Start over/ })).not.toBeNull();
  });

  it('calls onreset() on click', async () => {
    let called = 0;
    const { getByRole } = render(ResetButton, {
      onreset: () => {
        called++;
      },
    });
    await fireEvent.click(getByRole('button'));
    expect(called).toBe(1);
  });
});
