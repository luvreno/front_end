/** Storage helpers that never throw (private mode, blocked storage, SSR). */
type Kind = 'local' | 'session';
const get = (k: Kind): Storage | null => {
  try {
    if (typeof window === 'undefined') return null;
    return k === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};
export function readJSON<T>(key: string, fallback: T, kind: Kind = 'local'): T {
  try {
    const raw = get(kind)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeJSON(key: string, value: unknown, kind: Kind = 'local'): void {
  try {
    get(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
export function remove(key: string, kind: Kind = 'local'): void {
  try {
    get(kind)?.removeItem(key);
  } catch {
    /* ignore */
  }
}
