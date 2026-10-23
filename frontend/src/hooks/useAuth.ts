import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

function decodeToken(token: string | null): { exp?: number } | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null): boolean {
  const payload = decodeToken(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return payload.exp * 1000 > Date.now();
}

function readStoredToken(): string | null {
  const token = localStorage.getItem('admin_token');
  if (isTokenValid(token)) return token;
  localStorage.removeItem('admin_token');
  return null;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      if (res.data.success && isTokenValid(res.data.token)) {
        localStorage.setItem('admin_token', res.data.token);
        setToken(res.data.token);
        return true;
      }
      return false;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
  }, []);

  /* Automatically sign out when the JWT expires. */
  useEffect(() => {
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload?.exp) return;
    const remaining = payload.exp * 1000 - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(logout, remaining);
    return () => clearTimeout(timer);
  }, [token, logout]);

  return { login, logout, loading, isAuthenticated: isTokenValid(token), token };
}
