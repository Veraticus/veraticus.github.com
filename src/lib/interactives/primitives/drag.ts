/**
 * Pure pointer-drag state machine.
 *
 * The machine tracks an in-progress drag: which element is being dragged,
 * where the pointer started, and how far it has moved. A movement threshold
 * distinguishes an intentional drag from an accidental micro-movement during
 * a click, so the parent can fall through to click semantics when `moved`
 * stays false at pointer-up.
 */

import { extractPointerPosition, type Position } from './pointer';

export const MOVE_THRESHOLD = 4;

export interface DragState {
  draggingId: string | null;
  origin: Position;
  offset: Position;
  moved: boolean;
}

export interface DragEnd {
  dropId: string | null;
  dropPosition: Position | null;
  moved: boolean;
}

export function createDragState(): DragState {
  return {
    draggingId: null,
    origin: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    moved: false,
  };
}

export function handlePointerDown(
  _state: DragState,
  id: string,
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
): DragState {
  const origin = extractPointerPosition(event);
  return { draggingId: id, origin, offset: { x: 0, y: 0 }, moved: false };
}

export function handlePointerMove(
  state: DragState,
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
): DragState {
  if (state.draggingId === null) return state;
  const p = extractPointerPosition(event);
  const offset = { x: p.x - state.origin.x, y: p.y - state.origin.y };
  const moved = state.moved || Math.hypot(offset.x, offset.y) >= MOVE_THRESHOLD;
  return { ...state, offset, moved };
}

export function handlePointerUp(
  state: DragState,
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
): { state: DragState; result: DragEnd } {
  if (state.draggingId === null) {
    return {
      state,
      result: { dropId: null, dropPosition: null, moved: false },
    };
  }
  const result: DragEnd = {
    dropId: state.draggingId,
    dropPosition: extractPointerPosition(event),
    moved: state.moved,
  };
  return { state: createDragState(), result };
}
