import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bryatogngcaissitkgvv.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWF0b2duZ2NhaXNzaXRrZ3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMTkzMDIsImV4cCI6MjEwOTY5NTMwMn0.by5xepgYaKjHPJuR7Srt5TcP2scwLVZIoUxtXkiRj3U'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('[REXAM] Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export const getWebRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  return 'https://rexam.in/auth/callback'
}
