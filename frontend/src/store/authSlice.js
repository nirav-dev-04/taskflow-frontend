import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { authService } from "../services/authService";

/**
 * Auth store — persisted to localStorage under "taskflow_auth"
 *
 * Exposes:
 *   user, token, isAuthenticated, isLoading, error
 *   login(), register(), logout(), getMe(), updateUser()
 *   hasRole(role), hasAnyRole([roles])
 *   isAdmin(), isManager(), isEmployee()
 */
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ──────────────────────────────────────────────────────────
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // ── Actions ────────────────────────────────────────────────────────

        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const res = await authService.login(credentials);
            const { token, user } = res;
            localStorage.setItem("taskflow_token", token);
            localStorage.setItem("taskflow_user", JSON.stringify(user));
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { success: true, user };
          } catch (err) {
            const error = err.response?.data?.message || "Login failed";
            set({ isLoading: false, error });
            return { success: false, error };
          }
        },

        register: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const res = await authService.register(data);
            const { token, user } = res;
            localStorage.setItem("taskflow_token", token);
            localStorage.setItem("taskflow_user", JSON.stringify(user));
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { success: true, user };
          } catch (err) {
            const error = err.response?.data?.message || "Registration failed";
            set({ isLoading: false, error });
            return { success: false, error };
          }
        },

        logout: async () => {
          try {
            await authService.logout();
          } catch {
            // Always clear local state even if server call fails
          } finally {
            localStorage.removeItem("taskflow_token");
            localStorage.removeItem("taskflow_user");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          }
        },

        getMe: async () => {
          set({ isLoading: true });
          try {
            const user = await authService.getMe();
            set({ user, isAuthenticated: true, isLoading: false });
            return user;
          } catch {
            set({ isLoading: false, isAuthenticated: false });
          }
        },

        updateUser: (data) => {
          const updated = { ...get().user, ...data };
          localStorage.setItem("taskflow_user", JSON.stringify(updated));
          set({ user: updated });
        },

        clearError: () => set({ error: null }),

        // ── Role Helpers ───────────────────────────────────────────────────

        hasRole: (role) => get().user?.role === role,
        hasAnyRole: (roles = []) => roles.includes(get().user?.role),
        isAdmin: () => get().user?.role === "admin",
        isManager: () => get().user?.role === "manager",
        isEmployee: () => get().user?.role === "employee",
      }),
      {
        name: "taskflow_auth",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: "AuthStore" },
  ),
);
