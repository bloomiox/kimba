// Migration Script for Client Photos
// This script adds the before_photo_url and after_photo_url columns to the clients table

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Update these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateClientPhotos() {
  try {
    console.log('Starting client photos migration...');
    
    // Add before_photo_url and after_photo_url columns to clients table
    const { error } = await supabase
      .rpc('execute_sql', {
        sql: `
          ALTER TABLE clients 
          ADD COLUMN IF NOT EXISTS before_photo_url TEXT,
          ADD COLUMN IF NOT EXISTS after_photo_url TEXT;
        `
      });
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully added before_photo_url and after_photo_url columns to clients table');
    
    // Verify the changes
    const { data, error: selectError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (selectError) {
      throw selectError;
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateClientPhotos();