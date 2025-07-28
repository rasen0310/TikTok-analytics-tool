// デバッグ用コンポーネント - 本番では削除
import React from 'react';

export const DebugInfo: React.FC = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_TIKTOK_CLIENT_KEY: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
  };

  console.log('Environment variables:', envVars);

  // Environment status
  const supabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const tikTokConfigured = !!import.meta.env.VITE_TIKTOK_CLIENT_KEY;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      background: supabaseConfigured ? 'rgba(0,100,0,0.8)' : 'rgba(100,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '350px',
      borderRadius: '0 0 8px 0'
    }}>
      <h3 style={{ margin: '0 0 8px 0' }}>
        {supabaseConfigured ? '✅' : '❌'} Debug Info
      </h3>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Supabase:</strong> {supabaseConfigured ? '✅ Configured' : '❌ Missing'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>TikTok API:</strong> {tikTokConfigured ? '✅ Configured' : '⚠️ Optional'}
      </div>
      
      <details style={{ marginTop: '8px' }}>
        <summary style={{ cursor: 'pointer' }}>Environment Details</summary>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ fontSize: '10px', margin: '2px 0' }}>
            <strong>{key}:</strong> {value ? 'Set' : 'Missing'}
          </div>
        ))}
        <div style={{ fontSize: '10px', margin: '2px 0' }}>
          <strong>Location:</strong> {window.location.hostname}
        </div>
      </details>

      {!supabaseConfigured && (
        <div style={{ 
          marginTop: '8px', 
          padding: '4px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          <strong>⚠️ Action Required:</strong><br/>
          Set environment variables in Vercel Dashboard
        </div>
      )}
    </div>
  );
};