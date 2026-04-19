import { describe, it, expect, beforeEach } from 'vitest';
import { loadJSON, saveJSON } from '../../src/lib/interactives/primitives/persist';

describe('persist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadJSON returns fallback when key is absent', () => {
    expect(loadJSON('nope', { a: 1 })).toEqual({ a: 1 });
  });

  it('saveJSON then loadJSON roundtrips the same value', () => {
    saveJSON('k', { hello: 'world', n: 42 });
    expect(loadJSON('k', { hello: '', n: 0 })).toEqual({ hello: 'world', n: 42 });
  });

  it('loadJSON returns fallback when stored value is not valid JSON', () => {
    localStorage.setItem('bad', '{not json');
    expect(loadJSON('bad', { a: 1 })).toEqual({ a: 1 });
  });

  it('saveJSON is a no-op that does not throw when the value is unserialisable', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => saveJSON('circ', circular)).not.toThrow();
    expect(loadJSON('circ', null)).toBeNull();
  });

  it('saveJSON and loadJSON are no-ops when window is undefined', () => {
    const origWindow = globalThis.window;
    // @ts-expect-error -- simulating SSR for coverage
    delete globalThis.window;
    try {
      expect(() => saveJSON('ssr', { ok: true })).not.toThrow();
      expect(loadJSON('ssr', 'fallback')).toBe('fallback');
    } finally {
      globalThis.window = origWindow;
    }
  });
});
