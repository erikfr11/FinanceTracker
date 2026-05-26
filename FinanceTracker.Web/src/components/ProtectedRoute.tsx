import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // TODO: Schutzmechanismus! 
  // Um die App abzusichern, einfach im if-Zweig die && false Bedingung entfernen.
  // Aktuell ist die Protection durch `&& false` deaktiviert.
  // Aktuell ist die Protection AKTIV.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wenn eingeloggt render die Child-Routes:
  return <Outlet />;
};
