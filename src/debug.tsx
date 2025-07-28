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

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>Debug Info</h3>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value ? 'Set' : 'Missing'}
        </div>
      ))}
      <div><strong>Location:</strong> {window.location.href}</div>
      <div><strong>UserAgent:</strong> {navigator.userAgent.substring(0, 50)}...</div>
    </div>
  );
};