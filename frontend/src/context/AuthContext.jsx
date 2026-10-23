import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '../api/index.js';
import { clearToken, getToken, setToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!getToken()) {
        setBooting(false);
        return;
      }

      try {
        const data = await api.auth.me();
        if (!cancelled) setUser(data.user);
      } catch {
        clearToken();
      } finally {
        if (!cancelled) setBooting(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('nasaq:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('nasaq:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.auth.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, booting, login, logout }),
    [user, booting, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
