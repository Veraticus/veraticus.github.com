import { describe, it, expect } from 'vitest';
import {
  extractPointerPosition,
  hitTest,
} from '../../src/lib/interactives/primitives/pointer';

describe('extractPointerPosition', () => {
  it('returns clientX/clientY from a mouse-like event', () => {
    const e = new MouseEvent('pointerdown', { clientX: 120, clientY: 80 });
    expect(extractPointerPosition(e)).toEqual({ x: 120, y: 80 });
  });

  it('returns clientX/clientY from a PointerEvent-shaped object', () => {
    // jsdom doesn't ship PointerEvent on older versions; use a POJO matching the shape.
    const e = { clientX: 10, clientY: 20 } as unknown as PointerEvent;
    expect(extractPointerPosition(e)).toEqual({ x: 10, y: 20 });
  });
});

describe('hitTest', () => {
  const rect = {
    left: 100,
    top: 50,
    right: 200,
    bottom: 150,
    width: 100,
    height: 100,
    x: 100,
    y: 50,
    toJSON: () => ({}),
  } as DOMRect;

  it('returns true when the point is inside the rect', () => {
    expect(hitTest({ x: 150, y: 100 }, rect)).toBe(true);
  });

  it('is inclusive at the left/top edge', () => {
    expect(hitTest({ x: 100, y: 50 }, rect)).toBe(true);
  });

  it('is inclusive at the right/bottom edge', () => {
    expect(hitTest({ x: 200, y: 150 }, rect)).toBe(true);
  });

  it('returns false when the point is outside any edge', () => {
    expect(hitTest({ x: 99, y: 100 }, rect)).toBe(false);
    expect(hitTest({ x: 150, y: 49 }, rect)).toBe(false);
    expect(hitTest({ x: 201, y: 100 }, rect)).toBe(false);
    expect(hitTest({ x: 150, y: 151 }, rect)).toBe(false);
  });
});
