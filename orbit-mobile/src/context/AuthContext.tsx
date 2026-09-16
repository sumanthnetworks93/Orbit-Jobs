import { useAuth as useClerkAuth, useUser } from '@clerk/expo';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { hydratePlatformControls } from '../services/adminControl';
import { hydrateJobOverrides } from '../services/adminJobs';
import {
  getCurrentUser,
  isMockSession,
  subscribeAuth,
  type AuthUser,
} from '../services/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  idToken: string | null;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapClerkUser(user: {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  fullName?: string | null;
}): AuthUser {
  return {
    uid: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: user.fullName ?? null,
    name: user.fullName ?? null,
    role: 'seeker',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [mockUser, setMockUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void Promise.all([hydratePlatformControls(), hydrateJobOverrides()]);
  }, []);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((current) => {
        if (active && isMockSession(current)) {
          setMockUser(current);
        }
      })
      .catch(() => undefined);

    return subscribeAuth((nextUser) => {
      setMockUser(isMockSession(nextUser) ? nextUser : null);
    });
  }, []);

  const user = mockUser ?? (isLoaded && isSignedIn && clerkUser ? mapClerkUser(clerkUser) : null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: !isLoaded && !mockUser,
      idToken: null,
      refreshToken: () => getToken(),
    }),
    [mockUser, getToken, isLoaded, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
