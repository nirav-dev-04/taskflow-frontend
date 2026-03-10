import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// ─── Re-export all slices for convenient single-import ─────────────────────
export { useAuthStore } from "./authSlice";
export { useNotificationStore } from "./notificationSlice";
export { useProjectStore } from "./projectSlice";
export { useTaskStore } from "./taskSlice";

// ─── UI / App-level store ──────────────────────────────────────────────────
/**
 * Global UI store — persisted sidebar state + app-wide UI flags.
 *
 * Exposes:
 *   sidebarOpen, sidebarCollapsed, activeModal, globalLoading
 *   toggleSidebar(), setSidebarOpen(), toggleSidebarCollapsed()
 *   openModal(name), closeModal()
 *   setGlobalLoading(bool)
 */
export const useUIStore = create(
  devtools(
    persist(
      (set) => ({
        // ── Sidebar ─────────────────────────────────────────────────────────
        sidebarOpen: true,
        sidebarCollapsed: false,

        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        setSidebarOpen: (v) => set({ sidebarOpen: v }),
        toggleSidebarCollapsed: () =>
          set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

        // ── Modals ───────────────────────────────────────────────────────────
        activeModal: null,
        activeModalData: null,

        openModal: (name, data = null) =>
          set({ activeModal: name, activeModalData: data }),
        closeModal: () => set({ activeModal: null, activeModalData: null }),

        // ── Global loading overlay ────────────────────────────────────────
        globalLoading: false,
        setGlobalLoading: (v) => set({ globalLoading: v }),

        // ── Breadcrumbs ──────────────────────────────────────────────────
        breadcrumbs: [],
        setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
      }),
      {
        name: "taskflow_ui",
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      },
    ),
    { name: "UIStore" },
  ),
);
