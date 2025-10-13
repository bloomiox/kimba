import { createClient } from '@supabase/supabase-js';

type EnvSource = Record<string, string | undefined>;

const getImportMetaEnv = (): EnvSource => {
  try {
    return new Function(
      'return typeof import !== "undefined" && import.meta && import.meta.env ? import.meta.env : {};'
    )() as EnvSource;
  } catch {
    return {};
  }
};

const importMetaEnv: EnvSource = getImportMetaEnv();

const processEnv: EnvSource = typeof process !== 'undefined' ? (process.env as EnvSource) : {};

// Use environment variables for Supabase configuration with sensible fallbacks for tests
const supabaseUrl =
  importMetaEnv.VITE_SUPABASE_URL ||
  processEnv.VITE_SUPABASE_URL ||
  'https://xckveddinumudsnepkfx.supabase.co';

const supabaseAnonKey =
  importMetaEnv.VITE_SUPABASE_ANON_KEY ||
  processEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
