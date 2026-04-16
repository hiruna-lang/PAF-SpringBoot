import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { DEMO_PROFILES, USER_ROLES } from "../constants";

const AuthContext = createContext(null);
const STORAGE_KEY = "smart-campus-m3-auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const signIn = useCallback((role) => {
    setAuth({
      token: `demo-${role.toLowerCase()}-token`,
      role,
      user: DEMO_PROFILES[role],
    });
  }, []);

  const switchRole = useCallback((role) => {
    setAuth((current) => ({
      token: current?.token || `demo-${role.toLowerCase()}-token`,
      role,
      user: DEMO_PROFILES[role],
    }));
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
  }, []);

  const contextValue = useMemo(() => ({
    auth,
    role: auth?.role || null,
    user: auth?.user || null,
    isAuthenticated: Boolean(auth?.token),
    availableRoles: Object.values(USER_ROLES),
    signIn,
    switchRole,
    logout,
  }), [auth, signIn, switchRole, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
