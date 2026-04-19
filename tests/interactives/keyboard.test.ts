import { describe, it, expect } from 'vitest';
import {
  createKeyboardState,
  handleKeyDown,
  type KeyboardAction,
  type KeyboardState,
} from '../../src/lib/interactives/primitives/keyboard';

describe('keyboard state', () => {
  it('starts with no focused block and no picked-up block', () => {
    const state = createKeyboardState();
    expect(state.focusedBlockId).toBeNull();
    expect(state.pickedUpBlockId).toBeNull();
  });

  it('Space on a focused block emits a toggle action', () => {
    const state: KeyboardState = { focusedBlockId: 'mods', pickedUpBlockId: null };
    const result = handleKeyDown(state, {
      key: ' ',
      preventDefault: () => {},
    } as KeyboardEvent);
    expect(result.action).toEqual<KeyboardAction>({ type: 'toggle', blockId: 'mods' });
    expect(result.state).toEqual(state);
  });

  it('Enter behaves the same as Space', () => {
    const state: KeyboardState = { focusedBlockId: 'uniques', pickedUpBlockId: null };
    const result = handleKeyDown(state, {
      key: 'Enter',
      preventDefault: () => {},
    } as KeyboardEvent);
    expect(result.action).toEqual<KeyboardAction>({ type: 'toggle', blockId: 'uniques' });
  });

  it('Escape when a block is focused emits a blur action', () => {
    const state: KeyboardState = { focusedBlockId: 'ui', pickedUpBlockId: null };
    const result = handleKeyDown(state, {
      key: 'Escape',
      preventDefault: () => {},
    } as KeyboardEvent);
    expect(result.action).toEqual<KeyboardAction>({ type: 'blur' });
  });

  it('calls preventDefault on Space to block page scroll', () => {
    let prevented = false;
    const state: KeyboardState = { focusedBlockId: 'mods', pickedUpBlockId: null };
    handleKeyDown(state, {
      key: ' ',
      preventDefault: () => {
        prevented = true;
      },
    } as KeyboardEvent);
    expect(prevented).toBe(true);
  });

  it('returns no action when no block is focused', () => {
    const state = createKeyboardState();
    const result = handleKeyDown(state, {
      key: ' ',
      preventDefault: () => {},
    } as KeyboardEvent);
    expect(result.action).toBeNull();
  });

  it('ignores unhandled keys and does not preventDefault', () => {
    let prevented = false;
    const state: KeyboardState = { focusedBlockId: 'mods', pickedUpBlockId: null };
    const result = handleKeyDown(state, {
      key: 'a',
      preventDefault: () => {
        prevented = true;
      },
    } as KeyboardEvent);
    expect(result.action).toBeNull();
    expect(prevented).toBe(false);
  });
});
