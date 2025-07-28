import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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