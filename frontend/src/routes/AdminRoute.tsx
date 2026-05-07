// src/routes/AdminRoute.tsx
// Guards routes that require ADMIN role.
// While auth rehydrates, shows a spinner to prevent flash-of-redirect.
// Unauthenticated users → /login
// Authenticated non-ADMIN users → /dashboard

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import type { UserRole } from '@/types/auth';

interface AdminRouteProps {}

const ADMIN_ROLE: UserRole = 'ADMIN';

export default function AdminRoute(_props: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== ADMIN_ROLE) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
