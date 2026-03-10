import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("taskflow_token");
      const storedUser = localStorage.getItem("taskflow_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setIsLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  }, []);

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

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_user");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  const updateUser = useCallback((data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem("taskflow_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles = []) => roles.includes(user?.role);
  const isAdmin = () => user?.role === "admin";
  const isManager = () => user?.role === "manager";
  const isEmployee = () => user?.role === "employee";

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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
