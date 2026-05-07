// src/routes/index.tsx
// Application route definitions.
// Public routes: /login
// Protected routes: / (dashboard), /matches — wrapped in ProtectedRoute
// Unauthenticated users hitting protected routes are redirected to /login by ProtectedRoute.

import { Routes as RouterRoutes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import DashboardPage from '@/pages/DashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import LoginPage from '@/features/auth/LoginPage';
import AdminRoute from '@/routes/AdminRoute';
import ProtectedRoute from '@/routes/ProtectedRoute';
import MatchesPage from '@/features/matches/pages/MatchesPage';
import MatchDetailPage from '@/features/matches/pages/MatchDetailPage';

export default function Routes() {
  return (
    <RouterRoutes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — ProtectedRoute redirects unauthenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="matches/:id" element={<MatchDetailPage />} />
          <Route
            path="*"
            element={<div className="p-8 text-center">404 Not Found</div>}
          />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<MainLayout />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>
    </RouterRoutes>
  );
}