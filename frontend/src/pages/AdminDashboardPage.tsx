import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { matchService } from '@/services/matchService';
import type { SyncResult } from '@/services/matchService';

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Platform management and system overview.
          </p>
        </div>
        <Badge variant="destructive" className="px-3 py-1 font-medium">
          Admin Access Only
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed border-2 bg-muted/30 shadow-none hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl">User Management</CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <Link to="/admin/users">
              <Button variant="outline">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 bg-muted/30 shadow-none hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl">Match Configuration</CardTitle>
            <CardDescription>Setup and update match outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <Link to="/admin/matches">
              <Button variant="outline">Manage Matches</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 bg-muted/30 shadow-none hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl">Data Sync</CardTitle>
            <CardDescription>Fetch and upsert latest match data from the remote source.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-32 gap-2">
            <Button variant="outline" onClick={handleSyncClick} disabled={syncMutation.isPending}>
              {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
            </Button>
            {syncResult ? (
              <p className="text-xs text-muted-foreground">
                {'↑ '}
                {syncResult.created} created {'· '}
                {syncResult.updated} updated {'· '}
                {syncResult.failed} failed
              </p>
            ) : null}
            {syncError ? <p className="text-xs text-red-600">{syncError}</p> : null}
          </CardContent>
        </Card>
        
        <Card className="border-dashed border-2 bg-muted/30 shadow-none hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl">Result Entry</CardTitle>
            <CardDescription>Enter final scores for finished matches and trigger scoring.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <Link to="/admin/matches">
              <Button variant="outline">Enter Results</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 bg-muted/30 shadow-none hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl">System Settings</CardTitle>
            <CardDescription>Global platform configurations.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground italic">
            Content coming soon
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
