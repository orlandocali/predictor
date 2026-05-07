// src/types/user.ts
// Admin-specific user types. Separate from src/types/auth.ts which has the auth UserResponse (no displayName).
// All admin feature files must import UserResponse from here, not from @/types/auth.

export type UserRole = 'USER' | 'ADMIN';

/** Full user shape returned by admin endpoints — includes displayName */
export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Spring Page<T> shape returned by GET /api/v1/admin/users */
export interface UserPage {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-indexed current page
}

/** Payload for POST /api/v1/admin/users */
export interface CreateUserRequest {
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
}

/** Payload for PUT /api/v1/admin/users/{id} */
export interface UpdateUserRequest {
  username: string;
  displayName: string;
  role: UserRole;
  password?: string; // omit or send empty — backend ignores blank
}

/** Payload for PATCH /api/v1/admin/users/{id}/status */
export interface ToggleStatusRequest {
  active: boolean;
}
