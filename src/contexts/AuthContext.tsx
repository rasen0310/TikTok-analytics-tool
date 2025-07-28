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
  loginWithDemo: () => Promise<void>;
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
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
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userName,
          });
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        },
        // デモアカウントの場合は、メール確認をスキップするよう設定
        emailRedirectTo: undefined
      }
    });

    if (error) {
      throw error;
    }

    // ユーザープロファイルはauth.userのuser_metadataに保存される
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

  // デモアカウント用のログイン関数
  const loginWithDemo = async () => {
    const DEMO_EMAIL = 'demo@example.com';
    const DEMO_PASSWORD = 'password123';
    const DEMO_NAME = 'デモユーザー';

    try {
      // まずログインを試行
      await login(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (loginError) {
      // ログインに失敗した場合、アカウント作成を試行
      try {
        await signUp(DEMO_EMAIL, DEMO_PASSWORD, DEMO_NAME);
        
        // アカウント作成後、少し待ってからログインを再試行
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          await login(DEMO_EMAIL, DEMO_PASSWORD);
        } catch (secondError) {
          // まだログインできない場合は、メール確認が必要な可能性がある
          throw new Error('デモアカウントが作成されました。ログインには時間がかかる場合があります。');
        }
      } catch (signUpError: any) {
        // アカウントが既に存在するエラーの場合、再度ログインを試行
        if (signUpError.message?.includes('already') || signUpError.message?.includes('存在')) {
          await login(DEMO_EMAIL, DEMO_PASSWORD);
        } else {
          throw signUpError;
        }
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signUp,
    loginWithDemo,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};