import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + nav links */}
          <div className="flex items-center gap-10">
            <Link to="/" className="text-xl font-bold text-primary">
              ⚽ Predictor
            </Link>
            <div className="hidden space-x-6 md:flex items-center">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? 'text-primary font-semibold text-sm'
                    : 'text-muted-foreground hover:text-foreground text-sm transition-colors'
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/matches"
                className={({ isActive }) =>
                  isActive
                    ? 'text-primary font-semibold text-sm'
                    : 'text-muted-foreground hover:text-foreground text-sm transition-colors'
                }
              >
                Matches
              </NavLink>
              <NavLink
                to="/predictions"
                className={({ isActive }) =>
                  isActive
                    ? 'text-primary font-semibold text-sm'
                    : 'text-muted-foreground hover:text-foreground text-sm transition-colors'
                }
              >
                Predictions
              </NavLink>
              <NavLink
                to="/rankings"
                className={({ isActive }) =>
                  isActive
                    ? 'text-primary font-semibold text-sm'
                    : 'text-muted-foreground hover:text-foreground text-sm transition-colors'
                }
              >
                Rankings
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-primary font-semibold text-sm'
                      : 'text-muted-foreground hover:text-foreground text-sm transition-colors'
                  }
                >
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground md:block">
                {user.username}
              </span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}