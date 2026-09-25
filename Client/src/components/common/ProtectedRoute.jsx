/* eslint-disable no-undef */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Route guard that blocks access to pages until the user is authenticated.
// `allowedRoles` is used to permit only specific roles such as buyer, seller, or admin.
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className=" flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  const isGuestAllowed = allowedRoles?.includes(undefined);

  if (!user && !isGuestAllowed) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;

    if (user.role === "seller") return <Navigate to="/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// PublicRoute allows guest users to visit login and registration pages,
// while redirecting already authenticated users away from those screens.
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className=" flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;

    if (user.role === "seller") return <Navigate to="/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicRoute };
