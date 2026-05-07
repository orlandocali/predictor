// src/features/admin/pages/UserManagementPage.tsx
// Admin page: list users (paginated), create, edit, and toggle active status.

import { useState } from 'react';
import { format } from 'date-fns';
import { PlusCircle, Loader2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UserForm from '@/features/admin/components/UserForm';
import {
  useAdminUsers,
  useToggleUserStatus,
} from '@/features/admin/hooks/useUserAdmin';
import type { UserResponse } from '@/types/user';

// ---------------------------------------------------------------------------
// Sub-component: toggle active button
// ---------------------------------------------------------------------------
function ToggleActiveButton({ user }: { user: UserResponse }) {
  const toggleStatus = useToggleUserStatus();
  const isPending =
    toggleStatus.isPending && toggleStatus.variables?.id === user.id;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        toggleStatus.mutate({ id: user.id, active: !user.active })
      }
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : user.active ? (
        'Deactivate'
      ) : (
        'Activate'
      )}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function UserManagementPage() {
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | undefined>();

  const { data: userPage, isLoading, isError } = useAdminUsers(page);

  const totalPages = userPage?.totalPages ?? 0;
  const totalElements = userPage?.totalElements ?? 0;
  const users = userPage?.content ?? [];

  function openCreate() {
    setEditingUser(undefined);
    setPage(0); // reset to first page after creation
    setFormOpen(true);
  }

  function openEdit(user: UserResponse) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open);
    if (!open) setEditingUser(undefined);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage platform user accounts.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      {/* Create / Edit dialog */}
      <UserForm open={formOpen} onOpenChange={handleFormClose} user={editingUser} />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load users. Please refresh the page.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <p className="text-muted-foreground">No users yet.</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create the first user
          </Button>
        </div>
      )}

      {/* Users table */}
      {!isLoading && !isError && users.length > 0 && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.active ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-300"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <ToggleActiveButton user={user} />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(user)}
                          title="Edit user"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalElements} {totalElements === 1 ? 'user' : 'users'} total
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="tabular-nums">
                Page {page + 1} of {Math.max(totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
