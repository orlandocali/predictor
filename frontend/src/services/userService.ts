// src/services/userService.ts
// HTTP service layer for admin user management endpoints.
// All calls require ROLE_ADMIN (enforced server-side via JWT).

import { apiGet, apiPost, apiPut, apiPatch } from './api';
import type {
  UserPage,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ToggleStatusRequest,
} from '@/types/user';

export const userService = {
  /** GET /api/v1/admin/users?page=&size= */
  getUsers: (page: number, size = 20): Promise<UserPage> =>
    apiGet<UserPage>(`/api/v1/admin/users?page=${page}&size=${size}`),

  /** POST /api/v1/admin/users */
  createUser: (data: CreateUserRequest): Promise<UserResponse> =>
    apiPost<CreateUserRequest, UserResponse>('/api/v1/admin/users', data),

  /** PUT /api/v1/admin/users/{id} */
  updateUser: (id: string, data: UpdateUserRequest): Promise<UserResponse> =>
    apiPut<UpdateUserRequest, UserResponse>(`/api/v1/admin/users/${id}`, data),

  /** PATCH /api/v1/admin/users/{id}/status */
  toggleUserStatus: (id: string, data: ToggleStatusRequest): Promise<UserResponse> =>
    apiPatch<ToggleStatusRequest, UserResponse>(
      `/api/v1/admin/users/${id}/status`,
      data
    ),
};