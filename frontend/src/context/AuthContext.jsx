import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("skillmatch_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then((u) => !cancelled && setUser(u))
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          localStorage.removeItem("skillmatch_token");
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem("skillmatch_token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.register(data);
    localStorage.setItem("skillmatch_token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("skillmatch_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
