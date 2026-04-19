import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AttemptLog from '../../src/lib/interactives/primitives/AttemptLog.svelte';

describe('AttemptLog', () => {
  it('renders an empty-state message when entries is empty', () => {
    const { getByText } = render(AttemptLog, {
      entries: [],
      emptyMessage: 'No attempts yet.',
    });
    expect(getByText('No attempts yet.')).not.toBeNull();
  });

  it('renders each entry with label and text', () => {
    const { getByText } = render(AttemptLog, {
      entries: [
        { id: 'a', label: 'first', result: 'fit', text: 'OK' },
        { id: 'b', label: 'second', result: 'overflow', text: 'BAD' },
      ],
    });
    expect(getByText('first')).not.toBeNull();
    expect(getByText('second')).not.toBeNull();
    expect(getByText('OK')).not.toBeNull();
    expect(getByText('BAD')).not.toBeNull();
  });

  it('applies distinct data-result per entry for styling', () => {
    const { container } = render(AttemptLog, {
      entries: [
        { id: 'a', label: 'x', result: 'silent', text: 'DPS: 48' },
        { id: 'b', label: 'y', result: 'error', text: 'oops' },
      ],
    });
    const items = container.querySelectorAll('[data-result]');
    expect(items.length).toBe(2);
    expect(items[0].getAttribute('data-result')).toBe('silent');
    expect(items[1].getAttribute('data-result')).toBe('error');
  });

  it('renders entries in an ordered list with padded index prefixes', () => {
    const { container } = render(AttemptLog, {
      entries: [
        { id: '1', label: 'a', result: 'fit', text: 'x' },
        { id: '2', label: 'b', result: 'fit', text: 'y' },
      ],
    });
    const list = container.querySelector('ol');
    expect(list).not.toBeNull();
    expect(list?.textContent).toMatch(/01/);
    expect(list?.textContent).toMatch(/02/);
  });
});
