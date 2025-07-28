import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TikTokAccount {
  id: string;
  tiktok_user_id: string;
  tiktok_username: string;
  display_name?: string;
  avatar_url?: string;
  is_active: boolean;
  last_synced?: string;
  token_expires_at?: string;
  token_valid: boolean;
}

interface TikTokAuthConfig {
  clientKey: string;
  redirectUri: string;
  scope: string[];
}

export const useTikTokAuth = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const { user } = useAuth();

  // TikTok OAuth設定
  const TIKTOK_CONFIG: TikTokAuthConfig = {
    clientKey: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
    redirectUri: `${window.location.origin}/auth/tiktok/callback`,
    scope: ['user.info.basic', 'video.list'],
  };

  // OAuth認証URL生成
  const generateAuthUrl = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('ユーザーがログインしていません');

    // 状態トークン生成
    const stateToken = crypto.randomUUID();
    
      // 状態をデータベースに保存（テーブルが存在しない場合はスキップ）
    try {
      const { error } = await supabase
        .from('oauth_states')
        .insert({
          user_id: user.id,
          state_token: stateToken,
          provider: 'tiktok',
          redirect_url: window.location.pathname,
        });

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
    } catch (error) {
      // oauth_statesテーブルが存在しない場合はローカルストレージに保存
      localStorage.setItem(`oauth_state_${stateToken}`, JSON.stringify({
        user_id: user.id,
        redirect_url: window.location.pathname,
        created_at: new Date().toISOString()
      }));
    }

    // TikTok OAuth URL生成
    const params = new URLSearchParams({
      client_key: TIKTOK_CONFIG.clientKey,
      scope: TIKTOK_CONFIG.scope.join(','),
      response_type: 'code',
      redirect_uri: TIKTOK_CONFIG.redirectUri,
      state: stateToken,
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }, [user, TIKTOK_CONFIG]);

  // TikTok認証開始
  const startTikTokAuth = useCallback(async () => {
    try {
      setLoading(true);
      const authUrl = await generateAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('TikTok認証エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [generateAuthUrl]);

  // 認証コールバック処理
  const handleAuthCallback = useCallback(async (code: string, state: string) => {
    if (!user) throw new Error('ユーザーがログインしていません');

    try {
      setLoading(true);

      // 状態トークン検証（データベースまたはローカルストレージ）
      let stateData = null;
      try {
        const { data, error: stateError } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('state_token', state)
          .eq('user_id', user.id)
          .eq('used', false)
          .single();

        if (stateError && !stateError.message.includes('does not exist')) {
          throw stateError;
        }

        stateData = data;

        if (stateData) {
          // 状態を使用済みに更新
          await supabase
            .from('oauth_states')
            .update({ used: true })
            .eq('id', stateData.id);
        }
      } catch (error) {
        // ローカルストレージから検証
        const storedState = localStorage.getItem(`oauth_state_${state}`);
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          if (parsedState.user_id === user.id) {
            stateData = parsedState;
            localStorage.removeItem(`oauth_state_${state}`);
          }
        }
      }

      if (!stateData) {
        throw new Error('無効な状態トークンです');
      }

      // トークン交換をSupabase Edge Functionで実行（存在しない場合はスキップ）
      let data = null;
      try {
        const response = await supabase.functions.invoke('tiktok-oauth', {
          body: {
            code,
            redirect_uri: TIKTOK_CONFIG.redirectUri,
            user_id: user.id,
          },
        });

        if (response.error) {
          throw response.error;
        }
        data = response.data;
      } catch (error) {
        // Edge Function が存在しない場合はワーニングを表示
        console.warn('TikTok OAuth Edge Function が利用できません:', error);
        throw new Error('TikTok OAuth機能は現在利用できません。システム管理者にお問い合わせください。');
      }

      // アカウント一覧を更新
      await fetchTikTokAccounts();

      return data;
    } catch (error) {
      console.error('認証コールバックエラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, TIKTOK_CONFIG]);

  // TikTokアカウント一覧取得
  const fetchTikTokAccounts = useCallback(async () => {
    if (!user) return;

    try {
      // tiktok_accountsテーブルが存在しない場合は空配列を返す
      const { data, error } = await supabase
        .from('tiktok_accounts')
        .select(`
          id,
          tiktok_user_id,
          tiktok_username,
          display_name,
          avatar_url,
          is_active,
          last_synced,
          token_expires_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // テーブルが存在しない場合のエラーをキャッチ
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setAccounts([]);
          return;
        }
        throw error;
      }

      // token_expires_atをチェックしてtoken_validを設定
      const accountsWithTokenStatus = (data || []).map(account => ({
        ...account,
        token_valid: account.token_expires_at ? new Date(account.token_expires_at) > new Date() : false
      }));

      setAccounts(accountsWithTokenStatus);
    } catch (error) {
      console.error('TikTokアカウント取得エラー:', error);
      setAccounts([]);
    }
  }, [user]);

  // アカウント無効化
  const deactivateAccount = useCallback(async (accountId: string) => {
    if (!user) throw new Error('ユーザーがログインしていません');

    try {
      setLoading(true);

      const { error } = await supabase
        .from('tiktok_accounts')
        .update({ is_active: false })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }

      // アカウント一覧を更新
      await fetchTikTokAccounts();
    } catch (error) {
      console.error('アカウント無効化エラー:', error);
      if (error instanceof Error && !error.message?.includes('does not exist')) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, [user, fetchTikTokAccounts]);

  // トークン更新
  const refreshTokens = useCallback(async (accountId: string) => {
    if (!user) throw new Error('ユーザーがログインしていません');

    try {
      setLoading(true);

      const response = await supabase.functions.invoke('tiktok-refresh-token', {
        body: {
          account_id: accountId,
          user_id: user.id,
        },
      });

      if (response.error) {
        throw new Error('トークン更新機能は現在利用できません');
      }

      // アカウント一覧を更新
      await fetchTikTokAccounts();

      return response.data;
    } catch (error) {
      console.error('トークン更新エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, fetchTikTokAccounts]);

  // データ同期
  const syncAccountData = useCallback(async (accountId: string) => {
    if (!user) throw new Error('ユーザーがログインしていません');

    try {
      setLoading(true);

      const response = await supabase.functions.invoke('tiktok-sync-data', {
        body: {
          account_id: accountId,
          user_id: user.id,
        },
      });

      if (response.error) {
        throw new Error('データ同期機能は現在利用できません');
      }

      // アカウント一覧を更新
      await fetchTikTokAccounts();

      return response.data;
    } catch (error) {
      console.error('データ同期エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, fetchTikTokAccounts]);

  return {
    loading,
    accounts,
    startTikTokAuth,
    handleAuthCallback,
    fetchTikTokAccounts,
    deactivateAccount,
    refreshTokens,
    syncAccountData,
    isConfigured: !!TIKTOK_CONFIG.clientKey,
  };
};