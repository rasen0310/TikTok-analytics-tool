import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TikTokAuthState, TikTokUser } from '../types/tiktok-oauth';
import { createTikTokOAuth, TikTokOAuth } from '../lib/tiktok-oauth';

interface TikTokAuthContextType extends Omit<TikTokAuthState, 'refreshToken'> {
  connectTikTok: () => Promise<void>;
  disconnectTikTok: () => void;
  refreshToken: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<void>;
}

const TikTokAuthContext = createContext<TikTokAuthContextType | undefined>(undefined);

export const useTikTokAuth = () => {
  const context = useContext(TikTokAuthContext);
  if (context === undefined) {
    throw new Error('useTikTokAuth must be used within a TikTokAuthProvider');
  }
  return context;
};

const STORAGE_KEY = 'tiktok-auth-data';

export const TikTokAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<TikTokAuthState>({
    isConnected: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    loading: true,
    error: null,
  });

  const [tikTokOAuth] = useState<TikTokOAuth>(() => createTikTokOAuth());

  // ローカルストレージから認証情報を復元
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const authData = JSON.parse(stored);
          
          // トークンの有効期限チェック
          if (authData.expiresAt && Date.now() < authData.expiresAt) {
            setAuthState({
              ...authState,
              isConnected: true,
              user: authData.user,
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
              expiresAt: authData.expiresAt,
              loading: false,
            });
          } else if (authData.refreshToken) {
            // リフレッシュトークンで更新を試行
            try {
              await refreshTokenInternal(authData.refreshToken);
            } catch (error) {
              console.error('Token refresh failed:', error);
              clearStoredAuth();
            }
          } else {
            clearStoredAuth();
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Failed to load stored auth:', error);
        clearStoredAuth();
      }
    };

    loadStoredAuth();
  }, []);

  // 認証情報をローカルストレージに保存
  const saveAuthData = useCallback((data: {
    user: TikTokUser;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // 認証情報をクリア
  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      isConnected: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      loading: false,
      error: null,
    });
  }, []);

  // リフレッシュトークンでアクセストークンを更新
  const refreshTokenInternal = async (refreshToken: string): Promise<void> => {
    try {
      const tokenResponse = await tikTokOAuth.refreshAccessToken(refreshToken);
      const userInfo = await tikTokOAuth.getUserInfo(tokenResponse.access_token);
      
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
      
      const authData = {
        user: userInfo,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
      };

      saveAuthData(authData);
      
      setAuthState({
        isConnected: true,
        user: userInfo,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
        loading: false,
        error: null,
      });
    } catch (error) {
      throw error;
    }
  };

  // TikTok認証を開始
  const connectTikTok = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // 状態を生成してローカルストレージに保存（CSRF対策）
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('tiktok-oauth-state', state);
      
      const authUrl = tikTokOAuth.generateAuthUrl(state);
      window.location.href = authUrl;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'TikTok認証の開始に失敗しました',
      }));
    }
  };

  // TikTok認証を解除
  const disconnectTikTok = (): void => {
    clearStoredAuth();
  };

  // トークンを手動でリフレッシュ
  const refreshToken = async (): Promise<void> => {
    if (!authState.refreshToken) {
      throw new Error('リフレッシュトークンがありません');
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await refreshTokenInternal(authState.refreshToken);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'トークンの更新に失敗しました',
      }));
      clearStoredAuth();
      throw error;
    }
  };

  // OAuth コールバック処理
  const handleCallback = async (code: string, state: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // CSRF チェック
      const storedState = localStorage.getItem('tiktok-oauth-state');
      if (!storedState || storedState !== state) {
        throw new Error('無効な認証状態です。セキュリティのため認証を中止しました。');
      }

      // 認証コードをアクセストークンに交換
      const tokenResponse = await tikTokOAuth.exchangeCodeForToken(code);
      
      // ユーザー情報を取得
      const userInfo = await tikTokOAuth.getUserInfo(tokenResponse.access_token);
      
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
      
      const authData = {
        user: userInfo,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
      };

      saveAuthData(authData);
      
      setAuthState({
        isConnected: true,
        user: userInfo,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
        loading: false,
        error: null,
      });

      // 使用済みのstateを削除
      localStorage.removeItem('tiktok-oauth-state');
      
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'TikTok認証に失敗しました',
      }));
      localStorage.removeItem('tiktok-oauth-state');
      throw error;
    }
  };

  const value: TikTokAuthContextType = {
    ...authState,
    connectTikTok,
    disconnectTikTok,
    refreshToken,
    handleCallback,
  };

  return (
    <TikTokAuthContext.Provider value={value}>
      {children}
    </TikTokAuthContext.Provider>
  );
};