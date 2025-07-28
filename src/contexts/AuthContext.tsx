import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider rendering, loading:', loading, 'user:', user);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session retrieved:', !!session?.user);
        
        if (session?.user) {
          // Supabaseの組み込み認証ユーザー情報を直接使用
          let userName = session.user.user_metadata?.name || session.user.email || 'ユーザー';
          
          // usersテーブルからプロファイル情報を取得を試行（存在する場合）
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('name')
              .eq('id', session.user.id)
              .single();
            
            if (profile?.name) {
              userName = profile.name;
            }
          } catch (error) {
            // usersテーブルが存在しない場合はignore
            console.log('Users table not available, using auth metadata');
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userName,
          });
          console.log('User set from session:', session.user.email);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
        console.log('Auth initialization complete');
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state change:', _event, !!session?.user);
        if (session?.user) {
          // Supabaseの組み込み認証ユーザー情報を直接使用
          let userName = session.user.user_metadata?.name || session.user.email || 'ユーザー';
          
          // usersテーブルからプロファイル情報を取得を試行（存在する場合）
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('name')
              .eq('id', session.user.id)
              .single();
            
            if (profile?.name) {
              userName = profile.name;
            }
          } catch (error) {
            // usersテーブルが存在しない場合はignore
            console.log('Users table not available, using auth metadata');
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userName,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw error;
    }

    // ユーザープロファイルはauth.userのuser_metadataに保存される
    console.log('User signed up:', data.user?.email);
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('tiktokAnalyticsSettings');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signUp,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};