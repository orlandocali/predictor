import { Routes as RouterRoutes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';

export default function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="*" element={<div className="p-8 text-center">404 Not Found</div>} />
      </Route>
    </RouterRoutes>
  );
}