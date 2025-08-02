import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabaseのセッションをチェック
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'ユーザー'
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Auth状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'ユーザー'
        };
        setUser(userData);
        
        // OAuth認証成功時のリダイレクト処理
        const currentPath = window.location.pathname;
        console.log('Current path after sign in:', currentPath);
        if (currentPath === '/') {
          console.log('Redirecting to dashboard after OAuth success');
          window.history.replaceState(null, '', '/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // ログアウト時はルートページにリダイレクト（PrivateRouteがログイン画面を表示）
        if (window.location.pathname !== '/') {
          window.history.replaceState(null, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'ユーザー'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const loginWithGoogle = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw new Error('Googleログインに失敗しました');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('tiktok-analytics-user');
    }
  };


  const updateProfile = async (name: string, email: string) => {
    if (!user) {
      throw new Error('ログインが必要です');
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (error) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: name
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    loginWithGoogle,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};