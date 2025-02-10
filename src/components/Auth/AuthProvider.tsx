import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        localStorage.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh session periodically
  useEffect(() => {
    if (session) {
      const refreshInterval = setInterval(async () => {
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Error refreshing session:', error);
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }
        setSession(refreshedSession);
        setUser(refreshedSession?.user ?? null);
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;