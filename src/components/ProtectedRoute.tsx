import { Navigate, useLocation } from 'react-router-dom';
import { AppRole, getDashboardPath, getLoginPath, useAuth } from '@/hooks/useAuth';

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: AppRole;
}

function RoleRoute({ children, requiredRole }: RoleRouteProps) {
  const { loading, role, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to={getLoginPath(requiredRole)} replace state={{ from: location }} />;
  }

  if (role !== requiredRole) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute requiredRole="ADMIN">{children}</RoleRoute>;
}

export function UserRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute requiredRole="USER">{children}</RoleRoute>;
}

export default RoleRoute;
