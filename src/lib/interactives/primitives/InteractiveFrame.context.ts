import { getContext } from 'svelte';

export const INTERACTIVE_FRAME_KEY = Symbol('interactive-frame');

export interface FrameContext {
  readonly prefersReducedMotion: boolean;
  announce(msg: string): void;
}

export function useInteractiveFrame(): FrameContext {
  const ctx = getContext<FrameContext | undefined>(INTERACTIVE_FRAME_KEY);
  if (!ctx) {
    throw new Error('useInteractiveFrame() must be called inside an <InteractiveFrame>');
  }
  return ctx;
}
