"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, TOKEN_KEY } from "@/lib/api";

const AuthContext = createContext(null);

// UX-only hint for middleware.js. The backend must still enforce permissions on every request.
const setRoleCookie = (role) => {
  document.cookie = role
    ? `fida_role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
    : "fida_role=; path=/; max-age=0";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      setRoleCookie(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await api.getMe();
      setUser(me);
      setRoleCookie(me.role);
      return me;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setRoleCookie(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    setRoleCookie(u.role);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setRoleCookie(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh, setUser }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
