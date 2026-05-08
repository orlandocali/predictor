// src/types/auth.ts
// Single source of truth for all auth-related TypeScript interfaces.
// Mirrors the backend ApiResponse<T> wrapper: { data: T | null, error: string | null }

/** Generic API response wrapper matching the backend contract.
 * Fields are optional because @JsonInclude(NON_NULL) omits null fields from JSON.
 * On success: { data: T } - no error key.
 * On error: { error: string } - no data key.
 */
export interface ApiResponse<T> {
  data?: T | null;
  error?: string | null;
}

/** Credentials sent to POST /api/auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

export type UserRole = 'USER' | 'ADMIN';

/** Shape of the user returned by the backend (no email field — backend has none) */
export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Shape of the login response data payload */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

/** Shape of the refresh token request */
export interface RefreshTokenRequest {
  refreshToken: string;
}
