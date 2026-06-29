import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
type AppRole = 'admin' | 'user';

interface Props {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !role) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
