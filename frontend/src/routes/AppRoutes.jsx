import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import ProjectManagement from "../pages/admin/ProjectManagement";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";

// Manager Pages
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import MyProjects from "../pages/manager/MyProjects";
import MyTeam from "../pages/manager/MyTeam";
import SprintBoard from "../pages/manager/SprintBoard";
import Reports from "../pages/manager/Reports";

// Employee Pages
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import MyTasks from "../pages/employee/MyTasks";
import EmployeeProjects from "../pages/employee/MyProjects";
import Calendar from "../pages/employee/Calendar";
import Profile from "../pages/employee/Profile";

// Shared Pages
import NotFound from "../pages/shared/NotFound";
import Unauthorized from "../pages/shared/Unauthorized";

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "manager") return "/manager/dashboard";
    if (user.role === "employee") return "/employee/dashboard";
    return "/login";
  };

  return (
    <Routes>
      {/* ── Default redirect ─────────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* ── Auth routes (redirect away if already logged in) ─────────────── */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Register />
          )
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── Admin routes ─────────────────────────────────────────────────── */}
      <Route element={<RoleRoute roles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/projects" element={<ProjectManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* ── Manager routes ───────────────────────────────────────────────── */}
      <Route element={<RoleRoute roles={["manager"]} />}>
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/projects" element={<MyProjects />} />
        <Route path="/manager/team" element={<MyTeam />} />
        <Route path="/manager/sprint" element={<SprintBoard />} />
        <Route path="/manager/reports" element={<Reports />} />
      </Route>

      {/* ── Employee routes ──────────────────────────────────────────────── */}
      <Route element={<RoleRoute roles={["employee"]} />}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/tasks" element={<MyTasks />} />
        <Route path="/employee/projects" element={<EmployeeProjects />} />
        <Route path="/employee/calendar" element={<Calendar />} />
        <Route path="/employee/profile" element={<Profile />} />
      </Route>

      {/* ── Shared ──────────────────────────────────────────────────────── */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
