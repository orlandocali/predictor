import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-primary font-semibold text-sm'
    : 'text-muted-foreground hover:text-foreground text-sm transition-colors';

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'block rounded-md py-2.5 px-3 text-sm font-medium text-primary bg-primary/10'
    : 'block rounded-md py-2.5 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + desktop nav links */}
          <div className="flex items-center gap-10">
            <Link to="/" className="text-xl font-bold text-primary">
              ⚽ Predictor
            </Link>
            <div className="hidden space-x-6 md:flex items-center">
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/matches" className={navLinkClass}>
                Matches
              </NavLink>
              <NavLink to="/predictions" className={navLinkClass}>
                Predictions
              </NavLink>
              <NavLink to="/rankings" className={navLinkClass}>
                Rankings
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          {/* Desktop: user info + logout */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="hidden text-sm text-muted-foreground md:block">
                  {user.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex"
                  onClick={() => logout()}
                >
                  Sign out
                </Button>
              </>
            )}

            {/* Mobile: hamburger + sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 flex flex-col p-0">
                {/* Drawer header / logo */}
                <div className="px-4 py-5 border-b border-border">
                  <Link
                    to="/"
                    className="text-xl font-bold text-primary"
                    onClick={() => setOpen(false)}
                  >
                    ⚽ Predictor
                  </Link>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
                  <NavLink
                    to="/dashboard"
                    className={mobileNavLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/matches"
                    className={mobileNavLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    Matches
                  </NavLink>
                  <NavLink
                    to="/predictions"
                    className={mobileNavLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    Predictions
                  </NavLink>
                  <NavLink
                    to="/rankings"
                    className={mobileNavLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    Rankings
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      className={mobileNavLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </NavLink>
                  )}
                </nav>

                {/* User section */}
                {user && (
                  <div className="mt-auto">
                    <Separator />
                    <div className="flex flex-col gap-3 px-4 py-4">
                      <span className="text-sm text-muted-foreground truncate">
                        {user.username}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setOpen(false);
                          logout();
                        }}
                      >
                        Sign out
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}