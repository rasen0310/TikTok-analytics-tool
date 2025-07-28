import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
}

// Enhanced error handling types
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  loginWithDemo: () => Promise<void>;
  // Enhanced methods for better error handling
  authenticateUser: (email: string, password: string) => Promise<AuthResult>;
  createAccount: (email: string, password: string, name: string) => Promise<AuthResult>;
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
    // Test Supabase connection first
    const initializeAuth = async () => {
      console.log('🚀 Initializing authentication system...');
      
      // Test connection
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        console.error('🚨 Supabase connection failed during initialization');
        setLoading(false);
        return;
      }

      // Get initial session
      await getInitialSession();
    };

    const getInitialSession = async () => {
      try {
        console.log('📱 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
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

    initializeAuth();

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

  // Enhanced authentication method with detailed error handling
  const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
    console.log('🔐 Authenticating user:', email);
    
    try {
      // Validate input
      if (!email || !password) {
        return {
          success: false,
          error: 'メールアドレスとパスワードは必須です',
          errorCode: 'INVALID_INPUT'
        };
      }

      // Attempt authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ Authentication error:', error);
        
        // Handle specific error types
        const errorMessages: Record<string, string> = {
          'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
          'Email not confirmed': 'メールアドレスの確認が必要です',
          'Too many requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
          'User not found': 'ユーザーが見つかりません',
          'Invalid email': 'メールアドレスの形式が正しくありません',
        };

        return {
          success: false,
          error: errorMessages[error.message] || `認証エラー: ${error.message}`,
          errorCode: error.message,
          needsEmailConfirmation: error.message.includes('Email not confirmed')
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'ユーザー情報の取得に失敗しました',
          errorCode: 'NO_USER_DATA'
        };
      }

      console.log('✅ Authentication successful');
      
      const userData: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email || 'ユーザー',
      };

      return {
        success: true,
        user: userData
      };

    } catch (error) {
      console.error('🔥 Authentication exception:', error);
      return {
        success: false,
        error: `認証処理中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'EXCEPTION'
      };
    }
  };

  // Enhanced account creation method
  const createAccount = async (email: string, password: string, name: string): Promise<AuthResult> => {
    console.log('👤 Creating account for:', email);
    
    try {
      // Validate input
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'すべての項目を入力してください',
          errorCode: 'INVALID_INPUT'
        };
      }

      // Password strength validation
      if (password.length < 6) {
        return {
          success: false,
          error: 'パスワードは6文字以上である必要があります',
          errorCode: 'WEAK_PASSWORD'
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      if (error) {
        console.error('❌ Account creation error:', error);
        
        const errorMessages: Record<string, string> = {
          'User already registered': 'このメールアドレスは既に登録されています',
          'Invalid email': 'メールアドレスの形式が正しくありません',
          'Password should be at least 6 characters': 'パスワードは6文字以上である必要があります',
          'Signup is disabled': 'アカウント作成が無効になっています',
        };

        return {
          success: false,
          error: errorMessages[error.message] || `アカウント作成エラー: ${error.message}`,
          errorCode: error.message
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'アカウントの作成に失敗しました',
          errorCode: 'NO_USER_DATA'
        };
      }

      console.log('✅ Account creation successful');

      const userData: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || name,
      };

      return {
        success: true,
        user: userData,
        needsEmailConfirmation: !data.user.email_confirmed_at
      };

    } catch (error) {
      console.error('🔥 Account creation exception:', error);
      return {
        success: false,
        error: `アカウント作成中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'EXCEPTION'
      };
    }
  };

  // Legacy methods for backward compatibility - now use enhanced methods
  const signUp = async (email: string, password: string, name: string) => {
    const result = await createAccount(email, password, name);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await authenticateUser(email, password);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('tiktokAnalyticsSettings');
  };

  // Enhanced demo account login with better error handling
  const loginWithDemo = async () => {
    const DEMO_EMAIL = 'demo@example.com';
    const DEMO_PASSWORD = 'password123';
    const DEMO_NAME = 'デモユーザー';

    console.log('🚀 Enhanced demo login started:', DEMO_EMAIL);

    try {
      // First attempt: try to authenticate existing demo account
      console.log('📝 Attempting demo account authentication...');
      const authResult = await authenticateUser(DEMO_EMAIL, DEMO_PASSWORD);
      
      if (authResult.success) {
        console.log('✅ Demo authentication successful');
        return;
      }

      console.log('❌ Demo authentication failed:', authResult.error);
      console.log('🔧 Attempting demo account creation...');

      // Second attempt: create demo account if authentication failed
      const createResult = await createAccount(DEMO_EMAIL, DEMO_PASSWORD, DEMO_NAME);
      
      if (createResult.success) {
        console.log('✅ Demo account created successfully');
        
        // If email confirmation is needed, inform user
        if (createResult.needsEmailConfirmation) {
          throw new Error(
            'デモアカウントが作成されましたが、メール確認が必要です。\n' +
            'Supabaseの「Authentication → Settings」で「Enable email confirmations」を無効にしてください。'
          );
        }
        
        // Account created and ready to use
        return;
      }

      // Third attempt: if account already exists, try authentication again
      if (createResult.errorCode === 'User already registered') {
        console.log('🔄 Demo account exists, retrying authentication...');
        
        const retryResult = await authenticateUser(DEMO_EMAIL, DEMO_PASSWORD);
        if (retryResult.success) {
          console.log('✅ Demo authentication successful on retry');
          return;
        }
        
        // Provide specific error message based on the authentication failure
        if (retryResult.needsEmailConfirmation) {
          throw new Error(
            'デモアカウントが存在しますが、メール確認が完了していません。\n' +
            'Supabaseの「Authentication → Settings」で「Enable email confirmations」を無効にしてください。'
          );
        }
        
        throw new Error(`デモアカウントでのログインに失敗しました: ${retryResult.error}`);
      }

      // Account creation failed for other reasons
      throw new Error(`デモアカウントの作成に失敗しました: ${createResult.error}`);

    } catch (error) {
      console.error('🔥 Demo login process failed:', error);
      throw error;
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
    // Enhanced methods
    authenticateUser,
    createAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};