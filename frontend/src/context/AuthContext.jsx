// Who is logged in, shared across the app. (Owner: Core Team, Group 1 may extend)
//   const { user, isLoggedIn, hasRole, login, logout } = useAuth();
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore, setSessionExpiredHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restore the session on page refresh
  useEffect(() => {
    setSessionExpiredHandler(logout);
    if (!tokenStore.get()) return;
    api.get('/users/me')
      .then(({ data }) => setUser(data))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStore.set(data.token);
    const me = await api.get('/users/me');
    setUser(me.data);
    return me.data;
  }, []);

  const value = useMemo(() => ({
    user,
    checking,
    isLoggedIn: Boolean(user),
    hasRole: (...roles) => Boolean(user && roles.includes(user.role)),
    login,
    logout: async () => {
      try { await api.post('/auth/logout'); } catch { /* token may already be gone */ }
      logout();
    },
  }), [user, checking, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
