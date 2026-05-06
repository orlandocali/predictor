import { useHealth } from '../hooks/useHealth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function DashboardPage() {
  const { data, isLoading, isError } = useHealth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        Welcome to Predictor — FIFA World Cup 2026
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  );
}