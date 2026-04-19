import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import FillBar from '../../src/lib/interactives/primitives/FillBar.svelte';

describe('FillBar', () => {
  it('renders a progressbar role with value/min/max', () => {
    const { getByRole } = render(FillBar, { value: 67, max: 128 });
    const bar = getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('67');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('128');
  });

  it('includes a readable aria-valuetext with the unit', () => {
    const { getByRole } = render(FillBar, { value: 67, max: 128, unit: 'MB' });
    expect(getByRole('progressbar').getAttribute('aria-valuetext')).toMatch(/67 of 128 MB/);
  });

  it('data-overflowing is false at exactly capacity', () => {
    const { container } = render(FillBar, { value: 128, max: 128 });
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('data-overflowing')).toBe('false');
  });

  it('data-overflowing is true when value > max', () => {
    const { container } = render(FillBar, { value: 141, max: 128 });
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('data-overflowing')).toBe('true');
  });

  it('fill width is capped at 100% visually when value > max', () => {
    const { container } = render(FillBar, { value: 200, max: 128 });
    const fill = container.querySelector('.fill-bar-inner') as HTMLElement | null;
    expect(fill).not.toBeNull();
    expect(fill?.style.width).toBe('100%');
  });

  it('does not crash at value=0, max=0', () => {
    expect(() => render(FillBar, { value: 0, max: 0 })).not.toThrow();
  });
});
