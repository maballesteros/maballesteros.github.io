import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabaseClient';
import { AuthContext, type AuthContextValue } from '@/contexts/authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      setLoading(true);
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };

    void syncSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      signInWithPassword: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
      },
      signUpWithPassword: async (email, password) => {
        const basePath = import.meta.env.BASE_URL ?? '/';
        const redirectTo =
          typeof window !== 'undefined' ? `${window.location.origin}${basePath}` : undefined;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo
          }
        });
        if (error) {
          throw error;
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      }
    }),
    [loading, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

