import { createClient } from '@supabase/supabase-js';

// Supabase configuration validation and setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bijyeptqgqkbrbopelyz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpanllcHRxZ3FrYnJib3BlbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDY3MDIsImV4cCI6MjA2OTIyMjcwMn0.uUyZ_0ixcjJ9sKizqM6E8k1i3CUUbY4RmoKhsJIzuco';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Supabase configuration error: Missing URL or Anon Key');
  console.error('Current URL:', supabaseUrl);
  console.error('Has Anon Key:', !!supabaseAnonKey);
}

// Enhanced Supabase client options for better authentication handling
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const
  },
  global: {
    headers: {
      'User-Agent': 'TikTok-Analytics-Tool/1.0',
    },
  }
};

// Log configuration for debugging
console.log('🔧 Supabase Client Configuration:');
console.log('URL:', supabaseUrl);
console.log('Has Anon Key:', !!supabaseAnonKey);
console.log('Auth Options:', supabaseOptions.auth);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Connection test
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connection test successful');
    console.log('Current session:', data.session ? 'Active' : 'None');
    return { success: true, data };
  } catch (error) {
    console.error('🔥 Supabase connection test exception:', error);
    return { success: false, error };
  }
};

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  tiktok_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TikTokVideoData {
  id: string;
  user_id: string;
  video_url: string;
  post_date: string;
  post_time: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  new_followers: number;
  avg_watch_time: number;
  created_at: string;
}

export interface AnalyticsReport {
  id: string;
  user_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  data: any;
  created_at: string;
}