import { createClient } from '@supabase/supabase-js';

// These should be configured in your .env or .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-id.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
