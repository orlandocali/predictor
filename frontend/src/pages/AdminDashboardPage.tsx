import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
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
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground italic">
            Content coming soon
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 bg-muted/30 shadow-none hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl">Match Configuration</CardTitle>
            <CardDescription>Setup and update match outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground italic">
            Content coming soon
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
