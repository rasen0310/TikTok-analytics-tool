import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
    // Check for existing session
    const savedUser = localStorage.getItem('tiktokAnalyticsUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: 実際のAPIエンドポイントに置き換える
    // 一時的にモックログインを実装
    
    // モックユーザーデータ
    if (email === 'demo@example.com' && password === 'password123') {
      const mockUser: User = {
        id: '1',
        email: 'demo@example.com',
        name: 'デモユーザー',
      };
      
      setUser(mockUser);
      localStorage.setItem('tiktokAnalyticsUser', JSON.stringify(mockUser));
      return;
    }
    
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tiktokAnalyticsUser');
    localStorage.removeItem('tiktokAnalyticsSettings');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};