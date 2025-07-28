import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // ローカルストレージから認証状態を復元
    const savedUser = localStorage.getItem('tiktok-analytics-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // デフォルトユーザーをローカルストレージに保存（初回起動時）
    const savedCredentials = localStorage.getItem('tiktok-analytics-credentials');
    if (!savedCredentials) {
      localStorage.setItem('tiktok-analytics-credentials', JSON.stringify(DEFAULT_USER));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // ローカルストレージから保存された認証情報を取得
      const savedCredentials = localStorage.getItem('tiktok-analytics-credentials');
      const credentials = savedCredentials ? JSON.parse(savedCredentials) : DEFAULT_USER;
      
      // 認証チェック
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
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tiktok-analytics-user');
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