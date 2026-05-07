// src/routes/ProtectedRoute.tsx
// Guards routes that require authentication.
// While /me is loading, renders a full-screen spinner to prevent a flash-of-redirect.
// Unauthenticated users are redirected to /login.

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // While initial /me rehydration is in flight, show a neutral loading state.
  // This prevents an immediate redirect to /login before we know the auth status.
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

  return <Outlet />;
}