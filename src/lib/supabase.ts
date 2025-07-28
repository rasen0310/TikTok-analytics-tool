import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bijyeptqgqkbrbopelyz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpanllcHRxZ3FrYnJib3BlbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDY3MDIsImV4cCI6MjA2OTIyMjcwMn0.uUyZ_0ixcjJ9sKizqM6E8k1i3CUUbY4RmoKhsJIzuco';

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