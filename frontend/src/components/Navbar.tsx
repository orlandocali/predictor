import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              ⚽ Predictor
            </Link>
            <div className="ml-10 hidden space-x-8 md:block">
              <Link to="/" className="text-foreground font-medium">Dashboard</Link>
              <span className="text-muted-foreground cursor-not-allowed" title="Coming soon">Matches</span>
              <span className="text-muted-foreground cursor-not-allowed" title="Coming soon">Rankings</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}