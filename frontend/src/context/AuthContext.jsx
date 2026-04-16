import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(null);
  const [token, setToken]                 = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);

  // ── On app load — restore session from localStorage ──────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("taskflow_token");
      const storedUser  = localStorage.getItem("taskflow_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);

        // ✅ After restoring from localStorage, fetch fresh profile from DB
        // This ensures bio/name saved to backend are reflected even after re-login
        api.get("/auth/me").then(res => {
          const freshUser = res.user || res;
          if (freshUser?._id) {
            // Merge: DB data wins for profile fields, keep localStorage extras
            const merged = { ...JSON.parse(storedUser), ...freshUser };
            setUser(merged);
            localStorage.setItem("taskflow_user", JSON.stringify(merged));
          }
        }).catch(() => { /* silent — use cached data */ });
      }
    } catch {
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      const { token: newToken, user: newUser } = res;

      localStorage.setItem("taskflow_token", newToken);
      localStorage.setItem("taskflow_user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      // ✅ Fetch full profile immediately after login so bio/name from DB loads
      try {
        const profileRes = await api.get("/auth/me");
        const freshUser  = profileRes.user || profileRes;
        if (freshUser?._id) {
          const merged = { ...newUser, ...freshUser };
          setUser(merged);
          localStorage.setItem("taskflow_user", JSON.stringify(merged));
        }
      } catch { /* use login response user */ }

      setIsLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      const { token: newToken, user: newUser } = res;
      localStorage.setItem("taskflow_token", newToken);
      localStorage.setItem("taskflow_user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    finally {
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_user");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  // ── Update user (profile save) ────────────────────────────────────────────
  // ✅ Merges new data into existing user, saves to BOTH state and localStorage
  const updateUser = useCallback((data) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem("taskflow_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearError  = useCallback(() => setError(null), []);
  const hasRole     = (role)    => user?.role === role;
  const hasAnyRole  = (roles = []) => roles.includes(user?.role);
  const isAdmin     = () => user?.role === "admin";
  const isManager   = () => user?.role === "manager";
  const isEmployee  = () => user?.role === "employee";

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout,
      updateUser,
      clearError,
      hasRole,
      hasAnyRole,
      isAdmin,
      isManager,
      isEmployee,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;