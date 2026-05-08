import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}