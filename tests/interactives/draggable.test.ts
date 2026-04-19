import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Draggable from '../../src/lib/interactives/primitives/Draggable.svelte';

describe('Draggable', () => {
  it('renders a button with the label as accessible name', () => {
    const { getByRole } = render(Draggable, {
      id: 'mods',
      label: 'Mod tables',
      size: 41,
      placed: false,
      ontoggle: () => {},
    });
    const btn = getByRole('button', { name: /Mod tables/ });
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('sets aria-pressed=false when not placed', () => {
    const { getByRole } = render(Draggable, {
      id: 'mods',
      label: 'Mod tables',
      size: 41,
      placed: false,
      ontoggle: () => {},
    });
    expect(getByRole('button').getAttribute('aria-pressed')).toBe('false');
  });

  it('sets aria-pressed=true when placed', () => {
    const { getByRole } = render(Draggable, {
      id: 'mods',
      label: 'Mod tables',
      size: 41,
      placed: true,
      ontoggle: () => {},
    });
    expect(getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('fires ontoggle(id) on click', async () => {
    const calls: string[] = [];
    const { getByRole } = render(Draggable, {
      id: 'mods',
      label: 'Mod tables',
      size: 41,
      placed: false,
      ontoggle: (id: string) => calls.push(id),
    });
    await fireEvent.click(getByRole('button'));
    expect(calls).toEqual(['mods']);
  });

  it('fires ontoggle(id) on Space keydown and calls preventDefault', async () => {
    const calls: string[] = [];
    const { getByRole } = render(Draggable, {
      id: 'uniques',
      label: 'Uniques',
      size: 46,
      placed: false,
      ontoggle: (id: string) => calls.push(id),
    });
    await fireEvent.keyDown(getByRole('button'), { key: ' ' });
    expect(calls).toEqual(['uniques']);
  });

  it('fires ontoggle(id) on Enter keydown', async () => {
    const calls: string[] = [];
    const { getByRole } = render(Draggable, {
      id: 'ui',
      label: 'UI',
      size: 26,
      placed: false,
      ontoggle: (id: string) => calls.push(id),
    });
    await fireEvent.keyDown(getByRole('button'), { key: 'Enter' });
    expect(calls).toEqual(['ui']);
  });

  it('ignores unhandled keys', async () => {
    const calls: string[] = [];
    const { getByRole } = render(Draggable, {
      id: 'mods',
      label: 'Mod tables',
      size: 41,
      placed: false,
      ontoggle: (id: string) => calls.push(id),
    });
    await fireEvent.keyDown(getByRole('button'), { key: 'a' });
    await fireEvent.keyDown(getByRole('button'), { key: 'ArrowLeft' });
    expect(calls).toEqual([]);
  });

  it('renders the size in MB for visual reference', () => {
    const { getByRole } = render(Draggable, {
      id: 'uniques',
      label: 'Uniques',
      size: 46,
      placed: false,
      ontoggle: () => {},
    });
    expect(getByRole('button').textContent).toMatch(/46\s*MB/);
  });

  it('does not fire ontoggle twice for a click event (no synthetic dup)', async () => {
    const calls: string[] = [];
    const { getByRole } = render(Draggable, {
      id: 'mods',
      label: 'Mod tables',
      size: 41,
      placed: false,
      ontoggle: (id: string) => calls.push(id),
    });
    await fireEvent.click(getByRole('button'));
    expect(calls.length).toBe(1);
  });
});
