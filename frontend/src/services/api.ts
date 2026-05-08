// src/services/api.ts
// Axios instance with JWT Bearer token management.
// Token is stored in a module-scoped variable (NEVER localStorage) for security.
// The 401 interceptor dispatches a DOM event instead of importing AuthContext
// directly to avoid circular dependency issues.

import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/auth';

// ---------------------------------------------------------------------------
// In-memory token store — survives React re-renders but clears on page reload.
// This is intentional: a full reload invalidates the session (no persistence).
// ---------------------------------------------------------------------------
let accessToken: string | null = null;

/** Call this after a successful login to store the token. */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Read the current in-memory token (used internally by the interceptor). */
export function getAccessToken(): string | null {
  return accessToken;
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const api = axios.create({
  // Local dev: VITE_API_URL=http://localhost:8081 (direct to Spring Boot)
  // Docker:    VITE_API_URL is empty; nginx proxies /api → backend
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // needed if refresh token is ever moved to httpOnly cookie
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token to every request
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 Unauthorized
// Skips auth endpoints to prevent infinite redirect loops.
// ---------------------------------------------------------------------------
const AUTH_ENDPOINTS = ['/api/v1/auth/login', '/api/v1/auth/me', '/api/v1/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

      if (!isAuthEndpoint) {
        // Clear the in-memory token
        setAccessToken(null);
        // Notify AuthContext via a DOM event to avoid circular imports
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Typed helper — unwraps ApiResponse<T> and throws the error string if present
// ---------------------------------------------------------------------------
export async function apiGet<T>(url: string): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  if (response.data.data == null) {
    throw new Error('Received null data from server');
  }
  return response.data.data;
}

export async function apiPost<TBody, TResponse>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const response = await api.post<ApiResponse<TResponse>>(url, body);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  if (response.data.data == null) {
    throw new Error('Received null data from server');
  }
  return response.data.data;
}

export async function apiPatch<TBody, TResponse>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const response = await api.patch<ApiResponse<TResponse>>(url, body);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  if (response.data.data == null) {
    throw new Error('Received null data from server');
  }
  return response.data.data;
}

export async function apiPut<TBody, TResponse>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const response = await api.put<ApiResponse<TResponse>>(url, body);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  if (response.data.data == null) {
    throw new Error('Received null data from server');
  }
  return response.data.data;
}

export async function apiDelete(url: string): Promise<void> {
  const response = await api.delete<ApiResponse<null>>(url);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
}

export default api;