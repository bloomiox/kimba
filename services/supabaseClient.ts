import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These should be stored in environment variables, not hardcoded.
// For this example, we are using the keys you provided.
const supabaseUrl = 'https://xckveddinumudsnepkfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
