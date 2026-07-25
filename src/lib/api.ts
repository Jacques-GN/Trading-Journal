"use client";

import { useEffect, useState, useCallback } from "react";

export interface AccountSummary {
  id: string;
  name: string;
  broker: string | null;
  initialCapital: number;
  currency: string;
  color: string;
  isDefault: boolean;
  balance: number;
  realizedPnl: number;
  tradesCount: number;
  createdAt: string;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(
  url: string | null,
  opts: { refreshKey?: number } = {}
): { data: T | null; loading: boolean; error: string | null; refresh: () => void } {
  const [localKey, setLocalKey] = useState(0);
  const refresh = useCallback(() => setLocalKey((k) => k + 1), []);

  // Drive state from URL via a reducer-like pattern: each fetch produces a new state.
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !!url,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      return;
    }
    let cancelled = false;
    // Mark loading: wrap in microtask to avoid synchronous setState in effect.
    Promise.resolve().then(() => {
      if (!cancelled) {
        setState({ data: null, loading: true, error: null });
      }
    });
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) {
          setState({ data: json, loading: false, error: null });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: e.message ?? "Failed" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [url, opts.refreshKey, localKey]);

  return { data: state.data, loading: state.loading, error: state.error, refresh };
}

export async function apiPost<T>(
  url: string,
  body: unknown
): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error((e as { error?: string }).error ?? `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error((e as { error?: string }).error ?? `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export async function apiDelete(url: string): Promise<void> {
  const r = await fetch(url, { method: "DELETE" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}
