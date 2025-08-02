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
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

// デフォルトユーザー情報
const DEFAULT_USER = {
  id: '1',
  email: 'admin@tiktok-analytics.com',
  name: '管理者',
  password: 'admin123'
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
        } else {
          // ローカルストレージから認証状態を復元（後方互換性のため）
          const savedUser = localStorage.getItem('tiktok-analytics-user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Auth状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Supabaseで認証を試みる
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Supabaseでエラーが発生した場合、ローカル認証にフォールバック
        const savedCredentials = localStorage.getItem('tiktok-analytics-credentials');
        const credentials = savedCredentials ? JSON.parse(savedCredentials) : DEFAULT_USER;
        
        if (email === credentials.email && password === credentials.password) {
          const userData = {
            id: credentials.id,
            email: credentials.email,
            name: credentials.name
          };
          
          setUser(userData);
          localStorage.setItem('tiktok-analytics-user', JSON.stringify(userData));
        } else {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }
      } else if (data.user) {
        // Supabaseでログイン成功
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'ユーザー'
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('ログインが必要です');
    }

    // 現在のパスワードを確認
    const savedCredentials = localStorage.getItem('tiktok-analytics-credentials');
    const credentials = savedCredentials ? JSON.parse(savedCredentials) : DEFAULT_USER;
    
    if (currentPassword !== credentials.password) {
      throw new Error('現在のパスワードが正しくありません');
    }

    // 新しいパスワードで更新
    const updatedCredentials = {
      ...credentials,
      password: newPassword
    };
    
    localStorage.setItem('tiktok-analytics-credentials', JSON.stringify(updatedCredentials));
  };

  const updateProfile = async (name: string, email: string) => {
    if (!user) {
      throw new Error('ログインが必要です');
    }

    // プロフィール情報を更新
    const savedCredentials = localStorage.getItem('tiktok-analytics-credentials');
    const credentials = savedCredentials ? JSON.parse(savedCredentials) : DEFAULT_USER;
    
    const updatedCredentials = {
      ...credentials,
      name,
      email
    };
    
    const updatedUser = {
      id: user.id,
      name,
      email
    };

    localStorage.setItem('tiktok-analytics-credentials', JSON.stringify(updatedCredentials));
    localStorage.setItem('tiktok-analytics-user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    loginWithGoogle,
    logout,
    changePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};