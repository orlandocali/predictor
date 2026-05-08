import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Users, Calendar, RefreshCw, ClipboardList, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { matchService } from '@/services/matchService';
import type { SyncResult } from '@/services/matchService';
import { PageHeader } from '@/components/PageHeader';

export default function AdminDashboardPage() {
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncMutation = useMutation({
    mutationFn: () => matchService.syncMatches(),
    onSuccess: (data) => {
      setSyncResult(data);
      setSyncError(null);
    },
    onError: (error: unknown) => {
      setSyncResult(null);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    },
  });

  const handleSyncClick = () => {
    setSyncResult(null);
    setSyncError(null);
    syncMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform management and system overview."
        icon={<ShieldCheck className="h-5 w-5" />}
        action={<Badge variant="destructive" className="px-3 py-1 font-medium">Admin Only</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* User Management */}
        <Card className="group transition-colors hover:border-border/80">
          <CardHeader className="pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <Users className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="text-base">User Management</CardTitle>
            <CardDescription>View and manage all registered platform users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/users">
              <Button variant="outline" size="sm" className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Match Configuration */}
        <Card className="group transition-colors hover:border-border/80">
          <CardHeader className="pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="text-base">Match Configuration</CardTitle>
            <CardDescription>Set up matches and update final outcomes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/matches">
              <Button variant="outline" size="sm" className="w-full">Manage Matches</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Data Sync */}
        <Card className="group transition-colors hover:border-border/80">
          <CardHeader className="pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <RefreshCw className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="text-base">Data Sync</CardTitle>
            <CardDescription>Fetch and upsert the latest match data from the remote source.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSyncClick}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Syncing…
                </span>
              ) : (
                'Sync Now'
              )}
            </Button>
            {syncResult && (
              <p className="text-xs text-muted-foreground text-center">
                {syncResult.created} created · {syncResult.updated} updated · {syncResult.failed} failed
              </p>
            )}
            {syncError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{syncError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Result Entry */}
        <Card className="group transition-colors hover:border-border/80">
          <CardHeader className="pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <ClipboardList className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="text-base">Result Entry</CardTitle>
            <CardDescription>Enter final scores for finished matches and trigger scoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/matches">
              <Button variant="outline" size="sm" className="w-full">Enter Results</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
