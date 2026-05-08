import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative text-sm font-medium transition-colors',
    isActive
      ? 'text-primary after:absolute after:-bottom-[21px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-t-full'
      : 'text-muted-foreground hover:text-foreground'
  );

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center rounded-md py-2.5 px-3 text-sm font-medium transition-colors',
    isActive
      ? 'text-primary bg-primary/10 font-semibold'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  );

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'ADMIN';
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + desktop nav links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl font-display font-bold text-primary tracking-tight">
                ⚽ Predictor
              </span>
            </Link>
            <div className="hidden space-x-7 md:flex items-center h-16">
              <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/matches" className={navLinkClass}>Matches</NavLink>
              <NavLink to="/predictions" className={navLinkClass}>Predictions</NavLink>
              <NavLink to="/rankings" className={navLinkClass}>Rankings</NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
              )}
            </div>
          </div>

          {/* Desktop: theme toggle + user info + logout */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user && (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">
                      {user.username}
                    </span>
                    {isAdmin && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1.5"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </Button>
                </div>
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
              <SheetContent side="left" className="w-72 flex flex-col p-0 bg-card border-border">
                {/* Drawer header */}
                <div className="px-5 py-5 border-b border-border">
                  <Link
                    to="/"
                    className="flex items-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-xl font-display font-bold text-primary tracking-tight">
                      ⚽ Predictor
                    </span>
                  </Link>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
                  {[
                    { to: '/dashboard', label: 'Dashboard' },
                    { to: '/matches', label: 'Matches' },
                    { to: '/predictions', label: 'Predictions' },
                    { to: '/rankings', label: 'Rankings' },
                  ].map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={mobileNavLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </NavLink>
                  ))}
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
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{user.username}</span>
                          {isAdmin && (
                            <span className="text-xs text-destructive font-medium">Admin</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={toggleTheme}
                      >
                        {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => { setOpen(false); logout(); }}
                      >
                        <LogOut className="h-3.5 w-3.5" />
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