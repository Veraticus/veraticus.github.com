import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DropTarget from '../../src/lib/interactives/primitives/DropTarget.svelte';

describe('DropTarget', () => {
  it('renders a landmark region with the aria-label', () => {
    const { getByRole } = render(DropTarget, {
      label: 'Worker',
      used: 0,
      capacity: 128,
    });
    const region = getByRole('region', { name: 'Worker' });
    expect(region).not.toBeNull();
  });

  it('exposes used and capacity values in the DOM', () => {
    const { getByTestId } = render(DropTarget, {
      label: 'Worker',
      used: 41,
      capacity: 128,
    });
    expect(getByTestId('used').textContent).toMatch(/41/);
    expect(getByTestId('capacity').textContent).toMatch(/128/);
  });

  it('sets data-overflowing=false when used <= capacity', () => {
    const { container } = render(DropTarget, {
      label: 'Worker',
      used: 100,
      capacity: 128,
    });
    const region = container.querySelector('[role="region"]');
    expect(region?.getAttribute('data-overflowing')).toBe('false');
  });

  it('sets data-overflowing=false at exactly capacity (inclusive)', () => {
    const { container } = render(DropTarget, {
      label: 'Worker',
      used: 128,
      capacity: 128,
    });
    const region = container.querySelector('[role="region"]');
    expect(region?.getAttribute('data-overflowing')).toBe('false');
  });

  it('sets data-overflowing=true when used > capacity', () => {
    const { container } = render(DropTarget, {
      label: 'Worker',
      used: 141,
      capacity: 128,
    });
    const region = container.querySelector('[role="region"]');
    expect(region?.getAttribute('data-overflowing')).toBe('true');
  });

  it('renders with no children without error', () => {
    const { getByRole } = render(DropTarget, {
      label: 'Worker',
      used: 0,
      capacity: 128,
    });
    expect(getByRole('region')).not.toBeNull();
  });
});
