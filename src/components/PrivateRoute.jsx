import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getRoleDest(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'PENGCAB') return '/pengcab-panel';
  if (role === 'PENYELENGGARA') return '/penyelenggara';
  if (role === 'UMUM') return '/umum';
  return '/dashboard';
}

export function PrivateRoute({ children, adminOnly = false, pengcabOnly = false, userOnly = false, penyelenggaraOnly = false, umumOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Role-based access: redirect to the correct panel if wrong role
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to={getRoleDest(user.role)} replace />;
  }
  if (pengcabOnly && user.role !== 'PENGCAB') {
    return <Navigate to={getRoleDest(user.role)} replace />;
  }
  if (userOnly && user.role !== 'USER') {
    return <Navigate to={getRoleDest(user.role)} replace />;
  }
  if (penyelenggaraOnly && user.role !== 'PENYELENGGARA') {
    return <Navigate to={getRoleDest(user.role)} replace />;
  }
  if (umumOnly && user.role !== 'UMUM') {
    return <Navigate to={getRoleDest(user.role)} replace />;
  }

  return children;
}
