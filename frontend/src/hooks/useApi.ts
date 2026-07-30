import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

type ApiResponse<T> = { success: boolean; message?: string; [key: string]: unknown } & Record<string, T>;

export function useApi<T>(url: string, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url);
      const body = res.data as ApiResponse<T>;
      const dataKey = Object.keys(body).find((k) => k !== 'success' && k !== 'message' && k !== 'count' && k !== 'total' && k !== 'page' && k !== 'limit');
      setData(dataKey ? (body[dataKey] as T) : (body as unknown as T));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) fetch();
  }, [fetch, immediate]);

  return { data, loading, error, refetch: fetch };
}
