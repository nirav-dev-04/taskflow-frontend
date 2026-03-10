import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

/**
 * PrivateRoute — Requires the user to be authenticated.
 *
 * • Not authenticated → redirect to /login (saves intended path in state)
 * • Still loading     → show full-screen loader
 * • Authenticated     → render child routes via <Outlet />
 *
 * Usage in AppRoutes.jsx:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/profile" element={<Profile />} />
 *   </Route>
 */
export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
