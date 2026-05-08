// src/features/auth/useAuth.ts
// Public hook for consuming the AuthContext.
// Throw a clear error if used outside AuthProvider.

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
