import { describe, it, expect } from 'vitest';
import {
  createDragState,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  MOVE_THRESHOLD,
  type DragState,
} from '../../src/lib/interactives/primitives/drag';

const pointer = (x: number, y: number) => ({ clientX: x, clientY: y });

describe('drag state machine', () => {
  it('starts with no drag in progress', () => {
    const state = createDragState();
    expect(state.draggingId).toBeNull();
    expect(state.origin).toEqual({ x: 0, y: 0 });
    expect(state.offset).toEqual({ x: 0, y: 0 });
    expect(state.moved).toBe(false);
  });

  it('handlePointerDown records the origin and starts tracking the id', () => {
    const state = handlePointerDown(createDragState(), 'mods', pointer(100, 200));
    expect(state.draggingId).toBe('mods');
    expect(state.origin).toEqual({ x: 100, y: 200 });
    expect(state.offset).toEqual({ x: 0, y: 0 });
    expect(state.moved).toBe(false);
  });

  it('handlePointerMove updates offset relative to origin while dragging', () => {
    let state: DragState = handlePointerDown(createDragState(), 'mods', pointer(100, 200));
    state = handlePointerMove(state, pointer(115, 210));
    expect(state.offset).toEqual({ x: 15, y: 10 });
  });

  it('handlePointerMove is a no-op when no drag is in progress', () => {
    const before = createDragState();
    const after = handlePointerMove(before, pointer(999, 999));
    expect(after).toEqual(before);
  });

  it('movement below the threshold leaves moved=false', () => {
    let state: DragState = handlePointerDown(createDragState(), 'mods', pointer(100, 200));
    state = handlePointerMove(state, pointer(102, 201));
    expect(state.moved).toBe(false);
  });

  it('movement at or above the threshold sets moved=true and keeps it sticky', () => {
    let state: DragState = handlePointerDown(createDragState(), 'mods', pointer(100, 200));
    state = handlePointerMove(state, pointer(100 + MOVE_THRESHOLD, 200));
    expect(state.moved).toBe(true);
    // Subsequent move back under threshold keeps moved=true
    state = handlePointerMove(state, pointer(101, 200));
    expect(state.moved).toBe(true);
  });

  it('handlePointerUp returns the drop result and resets state', () => {
    let state: DragState = handlePointerDown(createDragState(), 'mods', pointer(100, 200));
    state = handlePointerMove(state, pointer(150, 260));
    const { state: afterUp, result } = handlePointerUp(state, pointer(160, 270));
    expect(result.dropId).toBe('mods');
    expect(result.dropPosition).toEqual({ x: 160, y: 270 });
    expect(result.moved).toBe(true);
    expect(afterUp).toEqual(createDragState());
  });

  it('handlePointerUp with no drag in progress returns a null result', () => {
    const before = createDragState();
    const { state: after, result } = handlePointerUp(before, pointer(10, 10));
    expect(result.dropId).toBeNull();
    expect(result.dropPosition).toBeNull();
    expect(result.moved).toBe(false);
    expect(after).toEqual(before);
  });
});
