import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    const redirect = user.role === 'ADMIN' ? '/admin' : '/employee';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
