import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook لجلب البيانات مع حالات التحميل والخطأ وإمكانية إعادة التحميل.
 */
export function useApi(fetcher, deps = []) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}

/** مؤقت يزيد قيمة كل ثانية (لساعة الحضور). */
export function useTicker(active = true) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [active]);

  return seconds;
}

export function useInterval(callback, delay = 1000) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (delay === null) return undefined;
    const timer = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(timer);
  }, [delay]);
}
