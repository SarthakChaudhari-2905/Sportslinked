import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authApi } from "../lib/endpoints";
import { setAccessToken, setUnauthorizedHandler } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const hasAttemptedInitialRefresh = useRef(false);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(
  "sportlinked-user-id"
);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // On first load, try to silently refresh the session using the httpOnly cookie.
  // Guarded so React StrictMode's dev-mode double-invoke of effects (or any
  // other double-mount) never fires two concurrent refresh requests, which
  // would otherwise race against the same rotating refresh token.
  useEffect(() => {
    if (hasAttemptedInitialRefresh.current) return;
    hasAttemptedInitialRefresh.current = true;

    (async () => {
      try {
        const { accessToken, user } = await authApi.refresh();
        setAccessToken(accessToken);
        setUser(user);
      } catch {
        clearSession();
      } finally {
        setInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { accessToken, user } = await authApi.login(email, password);
    setAccessToken(accessToken);
    setUser(user);
    localStorage.setItem(
  "sportlinked-user-id",
  user._id
);
    return user;
  }, []);

  const register = useCallback(async (payload) => {
    const { accessToken, user } = await authApi.register(payload);
    setAccessToken(accessToken);
    setUser(user);
    return user;
    localStorage.setItem(
  "sportlinked-user-id",
  user._id
);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshCurrentUser = useCallback(async () => {
    const { user } = await authApi.me();
    setUser(user);
    return user;
  }, []);

  const updateUserLocal = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    initializing,
    login,
    register,
    logout,
    refreshCurrentUser,
    updateUserLocal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

