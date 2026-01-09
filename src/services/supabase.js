import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tflkiucartklqisyvdrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbGtpdWNhcnRrbHFpc3l2ZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NzI0NDQsImV4cCI6MjA4MzQ0ODQ0NH0.pEWI0bIvox0EYsDCQ8V2sdJZaiP8rcaZN5mbB9P4J2s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)