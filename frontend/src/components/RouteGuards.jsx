import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { homeFor } from '../config/navigation.js';
import { LoadingState } from '../components/ui.jsx';

export function ProtectedRoute() {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="boot-screen">
        <span className="brand__mark brand__mark--large" />
        <LoadingState label="جارٍ تجهيز نظام نسق…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RoleRoute({ roles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;

  return children;
}
