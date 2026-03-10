import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

/**
 * RoleRoute — Requires authentication + one of the allowed roles.
 *
 * Props:
 *   roles {string[]} — permitted roles e.g. ["admin"] or ["admin","manager"]
 *
 * • Not authenticated        → /login  (saves intended path in state)
 * • Wrong role               → /unauthorized
 * • Still loading            → full-screen loader
 * • Authenticated + allowed  → render child routes via <Outlet />
 *
 * Usage in AppRoutes.jsx:
 *   <Route element={<RoleRoute roles={["admin"]} />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 */
export default function RoleRoute({ roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
