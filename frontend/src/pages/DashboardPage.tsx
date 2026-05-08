import { Link } from 'react-router-dom';
import { useHealth } from '../hooks/useHealth';
import { useAuth } from '@/features/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trophy, Calendar, Star, BarChart3, ShieldCheck, Activity } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

interface NavCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  label: string;
  accent?: boolean;
}

function NavCard({ title, description, icon, to, label, accent }: NavCardProps) {
  return (
    <Card className={`group transition-colors hover:border-primary/40 hover:bg-card/80 ${accent ? 'border-destructive/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {icon}
          </div>
          {accent && (
            <Badge variant="destructive" className="text-xs">Admin</Badge>
          )}
        </div>
        <CardTitle className="text-base font-semibold mt-2">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link to={to}>
          <Button
            variant={accent ? 'destructive' : 'outline'}
            size="sm"
            className="w-full group-hover:border-primary/50"
          >
            {label}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useHealth();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user?.username ?? 'Predictor'}`}
        description="World Cup 2026 — predict match outcomes, climb the leaderboard, and compete."
        icon={<Trophy className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            {isLoading && 'Checking...'}
            {isError && <span className="text-destructive font-medium">API Error</span>}
            {data && <span className="text-green-400 font-medium">API Online</span>}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NavCard
          title="Matches"
          description="View all group stage and knockout matches. Filter by status, stage, or group."
          icon={<Calendar className="h-4.5 w-4.5" />}
          to="/matches"
          label="View Matches"
        />
        <NavCard
          title="My Predictions"
          description="Submit and edit your score predictions before each match locks."
          icon={<Star className="h-4.5 w-4.5" />}
          to="/predictions"
          label="My Predictions"
        />
        <NavCard
          title="Rankings"
          description="See the global leaderboard and track your position among all predictors."
          icon={<BarChart3 className="h-4.5 w-4.5" />}
          to="/rankings"
          label="View Rankings"
        />
        {isAdmin && (
          <NavCard
            title="Admin Panel"
            description="Manage users, matches, results, sync data, and trigger scoring."
            icon={<ShieldCheck className="h-4.5 w-4.5" />}
            to="/admin"
            label="Go to Admin"
            accent
          />
        )}
      </div>

      {/* Scoring rules quick reference */}
      <div className="rounded-lg border border-border bg-card/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Scoring Rules
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { pts: '3', label: 'Exact Score', desc: 'Predict the exact final scoreline' },
            { pts: '1', label: 'Correct Outcome', desc: 'Win/Draw/Loss correct, score wrong' },
            { pts: '0', label: 'Incorrect', desc: 'Wrong outcome prediction' },
          ].map(({ pts, label, desc }) => (
            <div key={pts} className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary font-display">
                {pts}
              </span>
              <div>
                <p className="text-sm font-medium leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}