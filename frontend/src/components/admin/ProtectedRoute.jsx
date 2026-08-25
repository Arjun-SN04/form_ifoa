import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, checking } = useAdminAuth();

  if (checking) {
    return <div className="p-8 text-center text-slate-500">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
