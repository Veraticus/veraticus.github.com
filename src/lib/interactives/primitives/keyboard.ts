/**
 * Slot-based keyboard state machine for interactive widgets.
 *
 * Tab/Shift+Tab navigation is delegated to the browser's native focus order.
 * This module handles:
 *   - Space / Enter  → emit `toggle` action for the currently focused block
 *   - Escape         → emit `blur` action (parent decides whether to move focus)
 *
 * The machine itself is stateless across keypresses in the current design —
 * `pickedUpBlockId` is reserved for a future free-movement mode and unused in
 * the slot-based model we ship today.
 */

export interface KeyboardState {
  focusedBlockId: string | null;
  pickedUpBlockId: string | null;
}

export type KeyboardAction =
  | { type: 'toggle'; blockId: string }
  | { type: 'blur' };

export interface KeyboardResult {
  state: KeyboardState;
  action: KeyboardAction | null;
}

export function createKeyboardState(): KeyboardState {
  return { focusedBlockId: null, pickedUpBlockId: null };
}

export function handleKeyDown(
  state: KeyboardState,
  event: Pick<KeyboardEvent, 'key' | 'preventDefault'>,
): KeyboardResult {
  if (state.focusedBlockId === null) {
    return { state, action: null };
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    return { state, action: { type: 'toggle', blockId: state.focusedBlockId } };
  }

  if (event.key === 'Escape') {
    return { state, action: { type: 'blur' } };
  }

  return { state, action: null };
}
