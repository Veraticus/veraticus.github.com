/**
 * Vitest setup. Runs once before tests load.
 *
 * jsdom does not implement `window.matchMedia`. Components that query media
 * features (e.g. `prefers-reduced-motion`) blow up without a stub.
 */

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
}
