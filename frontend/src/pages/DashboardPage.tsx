import { Link } from 'react-router-dom';
import { useHealth } from '../hooks/useHealth';
import { useAuth } from '@/features/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function DashboardPage() {
  const { data, isLoading, isError } = useHealth();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome to Predictor — FIFA World Cup 2026
        </h1>
        <p className="text-muted-foreground mt-2">
          Predict match outcomes, climb the leaderboard, and compete with friends.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Backend health check</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Checking backend...</p>}
            {isError && (
              <div className="flex items-center justify-between">
                <span>API Connection</span>
                <Badge variant="destructive">Error</Badge>
              </div>
            )}
            {data && (
              <div className="flex items-center justify-between">
                <span>{data.service || 'API Connection'}</span>
                <Badge className="bg-green-600 hover:bg-green-700 text-white">UP</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matches */}
        <Card className="hover:bg-muted/30 transition-colors">
          <CardHeader>
            <CardTitle>Matches</CardTitle>
            <CardDescription>View all scheduled and completed matches.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-2">
            <Link to="/matches">
              <Button variant="outline">View Matches</Button>
            </Link>
          </CardContent>
        </Card>

        {/* My Predictions */}
        <Card className="hover:bg-muted/30 transition-colors">
          <CardHeader>
            <CardTitle>My Predictions</CardTitle>
            <CardDescription>Submit and track your match score predictions.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-2">
            <Link to="/predictions">
              <Button variant="outline">My Predictions</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Rankings */}
        <Card className="hover:bg-muted/30 transition-colors">
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>See the global leaderboard and your position.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-2">
            <Link to="/rankings">
              <Button variant="outline">View Rankings</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Admin — only visible to ADMIN users */}
        {isAdmin && (
          <Card className="border-destructive/40 hover:bg-muted/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Admin Panel
                <Badge variant="destructive" className="text-xs">Admin</Badge>
              </CardTitle>
              <CardDescription>Manage matches, users, and platform settings.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-2">
              <Link to="/admin">
                <Button variant="outline">Go to Admin</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}