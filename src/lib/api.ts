export interface ApiResult<T = unknown> { ok: boolean; status: number; data: T | null; error?: string }

/** POST JSON to a same-origin PHP endpoint. Success only when the server says ok. */
export async function postJSON<T = { ok: boolean; message?: string }>(url: string, body: unknown, timeoutMs = 15000): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
      signal: ctrl.signal,
    });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
    const serverOk = !!data && typeof data === 'object' && (data as { ok?: unknown }).ok === true;
    const error = data && typeof data === 'object' && typeof (data as { error?: unknown }).error === 'string' ? (data as unknown as { error: string }).error : undefined;
    return { ok: res.ok && serverOk, status: res.status, data, error };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    window.clearTimeout(t);
  }
}
