// src/features/auth/AuthContext.tsx
// React auth context — manages user state, login/logout, and /me rehydration.
// Uses TanStack Query to cache the /me endpoint.
// Listens for 'auth:logout' DOM event dispatched by the Axios 401 interceptor.

import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, setAccessToken, getAccessToken } from '@/services/api';
import type { LoginRequest, LoginResponse, UserResponse } from '@/types/auth';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface AuthContextValue {
  /** The currently authenticated user, or null if not logged in */
  user: UserResponse | null;
  /** True while the initial /me rehydration is in-flight */
  isLoading: boolean;
  /** Derived: true when user is non-null */
  isAuthenticated: boolean;
  /** Call to log in — handles token storage and navigation */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Call to log out — clears token and user state */
  logout: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserResponse | null>(null);

  // TanStack Query — fetch /me to rehydrate session on mount.
  // `enabled: false` initially; we manually trigger it once token is set.
  // On fresh page load with no token this will fail; we catch and swallow.
  const {
    isLoading: isMeLoading,
    refetch: refetchMe,
  } = useQuery<UserResponse>({
    queryKey: ['auth', 'me'],
    queryFn: () => apiGet<UserResponse>('/api/v1/auth/me'),
    enabled: false, // we trigger manually
    retry: false,   // don't hammer the server on 401
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const data = await apiPost<LoginRequest, LoginResponse>(
        '/api/v1/auth/login',
        credentials
      );

      // Store access token in memory
      setAccessToken(data.accessToken);

      // Set user state directly from login response (no extra /me call needed)
      setUser(data.user);

      // Seed the TanStack Query cache so /me doesn't re-fetch immediately
      queryClient.setQueryData(['auth', 'me'], data.user);

      navigate('/dashboard', { replace: true });
    },
    [navigate, queryClient]
  );

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Best-effort server-side logout (invalidates refresh token)
      await apiPost('/api/v1/auth/logout', {});
    } catch {
      // Ignore — local cleanup always happens
    } finally {
      setAccessToken(null);
      setUser(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      navigate('/login', { replace: true });
    }
  }, [navigate, queryClient]);

  // ---------------------------------------------------------------------------
  // Listen for 401 events from the Axios interceptor
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleForcedLogout = () => {
      setAccessToken(null);
      setUser(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [navigate, queryClient]);

  // ---------------------------------------------------------------------------
  // Attempt to rehydrate session from an existing token on mount.
  // Token is in-memory only — a fresh page load always starts with no token,
  // so we skip the /me call entirely to avoid an unnecessary 401 round-trip.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!getAccessToken()) return; // No token in memory — stay logged out silently
    refetchMe()
      .then(({ data }) => {
        if (data) setUser(data);
      })
      .catch(() => {
        // Token was invalid — remain logged out
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading: isMeLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
