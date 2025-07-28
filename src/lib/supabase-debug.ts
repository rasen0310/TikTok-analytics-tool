// Supabase認証設定のデバッグユーティリティ

import { supabase } from './supabase';
import { validateEmailFormats, diagnoseEmailIssue, getRecommendedDemoEmail } from './email-validation';

export interface SupabaseDebugInfo {
  url: string;
  hasAnonKey: boolean;
  isConnected: boolean;
  authSettings?: {
    emailConfirmation: boolean;
    signUpEnabled: boolean;
    autoConfirmEnabled: boolean;
  };
  error?: string;
}

export const getSupabaseDebugInfo = async (): Promise<SupabaseDebugInfo> => {
  const debugInfo: SupabaseDebugInfo = {
    url: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    isConnected: false,
  };

  try {
    // 接続テスト - 簡単なクエリを実行
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      debugInfo.error = error.message;
      debugInfo.isConnected = false;
    } else {
      debugInfo.isConnected = true;
    }

    // 現在のセッション情報をログ出力
    console.log('🔍 Current session:', data);

  } catch (error) {
    debugInfo.error = error instanceof Error ? error.message : 'Unknown error';
    debugInfo.isConnected = false;
  }

  return debugInfo;
};

export const testDemoAccountCreation = async () => {
  const DEMO_EMAIL = 'demo.user@gmail.com';
  const DEMO_PASSWORD = 'DemoPassword123!';
  
  console.log('🧪 デモアカウント作成テスト開始');
  console.log('📧 テスト用メールアドレス:', DEMO_EMAIL);
  console.log('🔐 テスト用パスワード:', DEMO_PASSWORD.replace(/./g, '*'));
  
  try {
    // 0. メールアドレス形式の事前チェック
    console.log('0️⃣ メールアドレス形式チェック...');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(DEMO_EMAIL);
    console.log('📧 メールアドレス形式チェック結果:', isValidEmail ? '✅ 有効' : '❌ 無効');
    
    if (!isValidEmail) {
      return {
        success: false,
        message: `メールアドレスの形式が無効です: ${DEMO_EMAIL}`,
        error: 'INVALID_EMAIL_FORMAT'
      };
    }

    // 1. 既存のデモアカウントを確認
    console.log('1️⃣ 既存アカウント確認...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    
    if (!signInError && signInData.user) {
      console.log('✅ 既存のデモアカウントでログイン成功');
      console.log('👤 ユーザー情報:', signInData.user);
      
      // ログアウト
      await supabase.auth.signOut();
      return { success: true, message: '既存アカウントが正常に動作しています' };
    }
    
    console.log('ℹ️ 既存アカウントなし、新規作成を試行...');
    
    // 2. 新規アカウント作成
    console.log('2️⃣ 新規アカウント作成...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: {
        data: {
          name: 'デモユーザー'
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ アカウント作成エラー:', signUpError);
      
      if (signUpError.message.includes('User already registered')) {
        console.log('🔄 既存ユーザーのため、ログインを再試行...');
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        
        if (retryError) {
          return { 
            success: false, 
            message: `既存アカウントがありますが、ログインできません: ${retryError.message}`,
            error: retryError
          };
        }
        
        console.log('✅ 既存アカウントでログイン成功');
        await supabase.auth.signOut();
        return { success: true, message: '既存アカウントでログイン成功' };
      }
      
      // メールアドレス関連のエラーの場合、詳細診断を実行
      if (signUpError.message.includes('invalid') || signUpError.message.includes('email')) {
        console.log('🔍 メールアドレスエラーの詳細診断...');
        const emailValidation = validateEmailFormats(DEMO_EMAIL);
        const emailDiagnosis = diagnoseEmailIssue(DEMO_EMAIL, signUpError.message);
        const recommendations = getRecommendedDemoEmail();
        
        console.log('📧 メール検証結果:', emailValidation);
        console.log('🩺 診断結果:', emailDiagnosis);
        console.log('💡 推奨メールアドレス:', recommendations);
        
        return { 
          success: false, 
          message: `メールアドレスエラー: ${signUpError.message}\n\n推奨解決策:\n${emailDiagnosis.recommendations.join('\n')}\n\n推奨メールアドレス: ${recommendations.primary}`,
          error: signUpError,
          emailDiagnosis,
          recommendations
        };
      }
      
      return { 
        success: false, 
        message: `アカウント作成失敗: ${signUpError.message}`,
        error: signUpError
      };
    }
    
    console.log('📊 アカウント作成結果:', signUpData);
    
    // 3. 作成されたアカウントでログイン試行
    if (signUpData.user) {
      console.log('3️⃣ 作成したアカウントでログイン試行...');
      
      // メール確認が必要かチェック
      if (!signUpData.user.email_confirmed_at) {
        console.log('📧 メール確認が必要なアカウントです');
        return { 
          success: false, 
          message: 'アカウントは作成されましたが、メール確認が必要です。Supabaseの設定で自動確認を有効にしてください。',
          needsEmailConfirmation: true
        };
      }
      
      // 少し待ってからログイン試行
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      
      if (loginError) {
        console.log('❌ 作成後ログインエラー:', loginError);
        return { 
          success: false, 
          message: `作成後のログインに失敗: ${loginError.message}`,
          error: loginError
        };
      }
      
      console.log('✅ 作成後ログイン成功');
      console.log('👤 ログインユーザー情報:', loginData.user);
      
      await supabase.auth.signOut();
      return { success: true, message: 'デモアカウントの作成とログインが正常に完了しました' };
    }
    
    return { success: false, message: 'アカウント作成は完了しましたが、ユーザー情報が取得できません' };
    
  } catch (error) {
    console.log('🔥 テスト中にエラー発生:', error);
    return { 
      success: false, 
      message: `テスト中にエラーが発生: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    };
  }
};

export const logSupabaseAuthSettings = async () => {
  console.log('🔧 Supabase認証設定情報:');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Anon Key設定:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('現在のセッション:', data);
    if (error) {
      console.log('セッション取得エラー:', error);
    }
  } catch (error) {
    console.log('認証接続エラー:', error);
  }
};