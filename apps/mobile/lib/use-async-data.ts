import { useState, useEffect, useCallback, useRef } from 'react';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

const DEFAULT_TIMEOUT_MS = 10_000;

export function withTimeout<T>(promise: Promise<T>, ms = DEFAULT_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Délai de connexion dépassé. Vérifie ta connexion.')), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: { timeoutMs?: number; autoRun?: boolean } = {},
): AsyncState<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, autoRun = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoRun);
  const [error, setError] = useState<Error | null>(null);
  const activeId = useRef(0);

  const run = useCallback(() => {
    const myId = ++activeId.current;
    setLoading(true);
    setError(null);
    withTimeout(fetcher(), timeoutMs)
      .then((v) => {
        if (myId !== activeId.current) return;
        setData(v);
        setLoading(false);
      })
      .catch((e) => {
        if (myId !== activeId.current) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (autoRun) run();
    return () => { activeId.current++; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run };
}
