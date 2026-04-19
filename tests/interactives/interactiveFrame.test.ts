import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import InteractiveFrame from '../../src/lib/interactives/primitives/InteractiveFrame.svelte';
import ContextConsumer from './__fixtures__/ContextConsumer.svelte';
import FrameWithConsumer from './__fixtures__/FrameWithConsumer.svelte';

describe('InteractiveFrame', () => {
  it('renders title in an accessible heading', () => {
    render(InteractiveFrame, { title: 'Test widget' });
    expect(screen.getByRole('heading', { name: 'Test widget' })).not.toBeNull();
  });

  it('exposes an aria-live region for announcements', () => {
    const { container } = render(InteractiveFrame, { title: 'Test' });
    const live = container.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-live')).toBe('polite');
  });

  it('applies aria-label from title to the section', () => {
    const { container } = render(InteractiveFrame, { title: 'Widget X' });
    const section = container.querySelector('section');
    expect(section?.getAttribute('aria-label')).toBe('Widget X');
  });

  it('throws when useInteractiveFrame() is called outside a frame', () => {
    expect(() => render(ContextConsumer)).toThrow(
      /must be called inside an <InteractiveFrame>/,
    );
  });

  it('announces messages through the aria-live region', async () => {
    const { container, getByRole } = render(FrameWithConsumer);
    const live = container.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    expect(live?.textContent).toBe('');

    await fireEvent.click(getByRole('button', { name: 'announce' }));
    // announce() clears then sets via queueMicrotask; give Svelte a tick.
    await tick();
    await new Promise((r) => queueMicrotask(() => r(null)));
    await tick();

    expect(live?.textContent).toBe('hello');
  });
});
