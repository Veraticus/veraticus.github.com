import { describe, it, expect } from 'vitest';
import { computeInsertionIndex } from '../../src/lib/interactives/primitives/reorder';

function rect(left: number, width = 100): DOMRect {
  return {
    left,
    top: 0,
    right: left + width,
    bottom: 100,
    width,
    height: 100,
    x: left,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('computeInsertionIndex', () => {
  it('returns 0 when there are no children', () => {
    expect(computeInsertionIndex(42, [])).toBe(0);
  });

  it('returns 0 when the pointer is left of every midpoint', () => {
    const rects = [rect(100), rect(220), rect(340)];
    expect(computeInsertionIndex(50, rects)).toBe(0);
  });

  it('returns the index after the last midpoint when pointer is past all children', () => {
    const rects = [rect(100), rect(220), rect(340)];
    expect(computeInsertionIndex(500, rects)).toBe(3);
  });

  it('returns 1 when pointer sits between the first and second midpoints', () => {
    const rects = [rect(100), rect(220)]; // midpoints 150 and 270
    expect(computeInsertionIndex(200, rects)).toBe(1);
  });

  it('returns 2 when pointer sits between the second and third midpoints', () => {
    const rects = [rect(100), rect(220), rect(340)]; // midpoints 150, 270, 390
    expect(computeInsertionIndex(300, rects)).toBe(2);
  });

  it('at exactly a midpoint, chooses the slot AFTER (stable tiebreak)', () => {
    const rects = [rect(100), rect(220)]; // midpoints 150 and 270
    expect(computeInsertionIndex(150, rects)).toBe(1);
    expect(computeInsertionIndex(270, rects)).toBe(2);
  });
});
