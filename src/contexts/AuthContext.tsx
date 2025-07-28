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

    console.log('🚀 デモログイン開始:', DEMO_EMAIL);

    try {
      // まずログインを試行
      console.log('📝 デモアカウントでログイン試行...');
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      console.log('✅ デモログイン成功');
    } catch (loginError: any) {
      console.log('❌ デモログイン失敗:', loginError.message);
      console.log('🔧 アカウント作成を試行...');
      
      // ログインに失敗した場合、アカウント作成を試行
      try {
        const { data, error } = await supabase.auth.signUp({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          options: {
            data: {
              name: DEMO_NAME
            },
            emailRedirectTo: undefined
          }
        });

        console.log('📊 サインアップレスポンス:', { data, error });

        if (error) {
          console.log('⚠️ サインアップエラー:', error);
          
          // "User already registered" エラーの場合、既存アカウントでログイン試行
          if (error.message?.includes('already') || error.message?.includes('User already registered')) {
            console.log('🔄 既存アカウントでログイン再試行...');
            await login(DEMO_EMAIL, DEMO_PASSWORD);
            console.log('✅ 既存アカウントログイン成功');
            return;
          }
          throw error;
        }

        // アカウント作成が成功した場合
        if (data.user && !data.user.email_confirmed_at) {
          console.log('📧 メール確認待ちアカウントが作成されました');
          
          // メール確認が必要ない場合（ローカル開発など）は直接ログイン試行
          console.log('🔄 作成後のログイン試行...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            await login(DEMO_EMAIL, DEMO_PASSWORD);
            console.log('✅ 作成後ログイン成功');
          } catch (secondError: any) {
            console.log('❌ 作成後ログイン失敗:', secondError.message);
            
            // 特定のエラーメッセージに基づいて対処
            if (secondError.message?.includes('Email not confirmed')) {
              throw new Error('デモアカウントが作成されましたが、メール確認が必要です。Supabaseの設定を確認してください。');
            } else if (secondError.message?.includes('Invalid login credentials')) {
              throw new Error('デモアカウントの認証情報に問題があります。Supabaseの認証設定を確認してください。');
            } else {
              throw new Error(`デモアカウント作成後のログインに失敗: ${secondError.message}`);
            }
          }
        } else if (data.user && data.user.email_confirmed_at) {
          console.log('✅ 確認済みアカウントが作成されました');
          // 既に確認済みの場合はセッションが自動的に開始される
        } else {
          throw new Error('アカウント作成に失敗しました');
        }

      } catch (signUpError: any) {
        console.log('🔥 サインアップ処理エラー:', signUpError);
        throw signUpError;
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