/**
 * Pointer helpers shared across interactive primitives.
 *
 * Kept as pure functions so they're trivial to unit-test without a DOM.
 * The component layer (Draggable, DropTarget) composes these with Svelte's
 * reactivity — primitives never manage their own placement state.
 */

export interface Position {
  x: number;
  y: number;
}

export function extractPointerPosition(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
): Position {
  return { x: event.clientX, y: event.clientY };
}

export function hitTest(point: Position, rect: DOMRect): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}
