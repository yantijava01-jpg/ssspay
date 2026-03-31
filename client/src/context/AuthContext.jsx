import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true on first load

  // ── Bootstrap: restore session from localStorage ─────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem("ssspay_token");
    const storedUser  = localStorage.getItem("ssspay_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("ssspay_token");
        localStorage.removeItem("ssspay_user");
      }
    }
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (phone, password) => {
    const res = await authService.login({ phone, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem("ssspay_token", newToken);
    localStorage.setItem("ssspay_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("ssspay_token");
    localStorage.removeItem("ssspay_user");
    setToken(null);
    setUser(null);
  }, []);

  // ── Update local user state (e.g. after balance change via socket) ────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("ssspay_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── Refresh profile from server ───────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    try {
      const res = await authService.getDashboard();
      const data = res.data;
      updateUser({
        balance: data.balance,
        reward: data.reward,
        isFrozen: data.isFrozen,
        totalDeposits: data.totalDeposits,
        totalWithdrawals: data.totalWithdrawals,
        teamCount: data.teamCount,
      });
    } catch (err) {
      console.error("Failed to refresh profile:", getErrorMessage(err));
    }
  }, [updateUser]);

  const isAdmin      = user?.role === "admin";
  const isLoggedIn   = !!user && !!token;
  const isActive     = user?.status === "active";
  const isFrozen     = user?.isFrozen === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isLoggedIn,
        isActive,
        isFrozen,
        login,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
