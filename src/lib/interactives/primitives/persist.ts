/**
 * Tiny wrappers around localStorage for JSON-shaped state.
 *
 * SSR-safe: every operation guards on `typeof window !== 'undefined'`.
 * Failure-tolerant: unparseable storage, quota errors, and unserialisable
 * values all fall back gracefully rather than throwing.
 */

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded, circular ref, or storage blocked by the user --
    // persistence is best-effort.
  }
}
