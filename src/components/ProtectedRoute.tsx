import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ForbiddenPage from '../pages/ForbiddenPage';
import type { UserRole } from '../types/user';

interface ProtectedRouteProps {
  /** Si se indica, además de la sesión exige alguno de estos roles. */
  roles?: UserRole[];
}

/** Deja ver las rutas de adentro solo con sesión y, si corresponde, con el rol indicado. */
function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Sin sesión: al login, recordando adónde quería ir.
    return <Navigate to="/ingresar" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
