
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, mapUserToAuthUser } from '@/lib/auth/types';

interface UseAuthSessionResult {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuthSession = (): UseAuthSessionResult => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log('Setting up auth session hook...');
    let ignoreUpdates = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (ignoreUpdates) return;
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          console.log('User signed out, cleared session state');
        } else if (currentSession) {
          setSession(currentSession);
          if (currentSession?.user) {
            setUser(mapUserToAuthUser(currentSession.user));
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (ignoreUpdates) return;
      
      console.log('Initial session check:', currentSession?.user?.email);
      setSession(currentSession);
      if (currentSession?.user) {
        setUser(mapUserToAuthUser(currentSession.user));
      }
      setIsLoading(false);
    });

    return () => {
      ignoreUpdates = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };
};
