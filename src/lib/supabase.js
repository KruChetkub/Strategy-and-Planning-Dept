import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function withSupabaseTimeout(promise, label = 'Supabase request', timeoutMs = 8000) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}
