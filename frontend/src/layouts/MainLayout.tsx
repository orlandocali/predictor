import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FIFA World Cup 2026 Prediction Platform
      </footer>
    </div>
  );
}