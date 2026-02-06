/**
 * Supabase Client Configuration
 * This file initializes and exports the Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
// Use placeholder values if not set (for build time)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

