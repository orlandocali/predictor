// src/features/admin/hooks/useUserAdmin.ts
// TanStack Query hooks and Zod schemas for admin user management.
// Exports schemas used by UserForm and query hooks used by UserManagementPage.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from '@/features/shared/utils/validationSchemas';
import type { UserPage, UserResponse } from '@/types/user';

export { createUserSchema, updateUserSchema, type CreateUserFormValues, type UpdateUserFormValues };

// ---------------------------------------------------------------------------
// Query key constants
// ---------------------------------------------------------------------------
export const ADMIN_USERS_KEY = ['admin', 'users'] as const;

// ---------------------------------------------------------------------------
// Schemas — exported for use by UserForm
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// useAdminUsers — paginated list of all users
// ---------------------------------------------------------------------------
export function useAdminUsers(page: number, size = 20) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, { page, size }],
    queryFn: () => userService.getUsers(page, size),
  });
}

// ---------------------------------------------------------------------------
// useCreateUser — POST /api/v1/admin/users
// On success: invalidate all admin users queries.
// ---------------------------------------------------------------------------
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateUserFormValues) =>
      userService.createUser({
        username: values.username,
        password: values.password,
        displayName: values.displayName,
        role: values.role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateUser — PUT /api/v1/admin/users/{id}
// On success: invalidate all admin users queries.
// ---------------------------------------------------------------------------
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateUserFormValues }) => {
      const payload: {
        username: string;
        displayName: string;
        role: 'USER' | 'ADMIN';
        password?: string;
      } = {
        username: values.username,
        displayName: values.displayName,
        role: values.role,
      };
      // Only include password if the admin typed one
      if (values.password && values.password.length > 0) {
        payload.password = values.password;
      }
      return userService.updateUser(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// useToggleUserStatus — PATCH /api/v1/admin/users/{id}/status
// Optimistic update: flips `active` immediately; rolls back on error.
// ---------------------------------------------------------------------------
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      userService.toggleUserStatus(id, { active }),

    onMutate: async ({ id, active }) => {
      // Cancel in-flight refetches to avoid clobbering optimistic update
      await queryClient.cancelQueries({ queryKey: ADMIN_USERS_KEY });

      // Snapshot all paginated cache entries for rollback
      const snapshots = queryClient.getQueriesData<UserPage>({
        queryKey: ADMIN_USERS_KEY,
      });

      // Optimistically update the target user's active flag across all pages
      queryClient.setQueriesData<UserPage>(
        { queryKey: ADMIN_USERS_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((u: UserResponse) =>
              u.id === id ? { ...u, active } : u
            ),
          };
        }
      );

      return { snapshots };
    },

    onError: (_err, _vars, context) => {
      // Restore all snapshots on failure
      if (context?.snapshots) {
        for (const [queryKey, data] of context.snapshots) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: () => {
      // Re-sync from server after either success or error
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}
