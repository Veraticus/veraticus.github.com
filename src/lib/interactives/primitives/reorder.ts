/**
 * Insertion-index helper for drop-time reordering.
 *
 * Given a horizontal pointer position and the bounding rects of the
 * children already in the target, returns the index at which a new
 * item should be inserted to land where the pointer released.
 *
 * Tiebreak: a pointer position exactly on a child's horizontal midpoint
 * inserts AFTER that child (stable, predictable). Documented in tests.
 */

export function computeInsertionIndex(pointerX: number, childRects: DOMRect[]): number {
  for (let i = 0; i < childRects.length; i++) {
    const midX = childRects[i].left + childRects[i].width / 2;
    if (pointerX < midX) return i;
  }
  return childRects.length;
}
