// Test script to check if client_photo_pairs table exists and is accessible
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the app
const supabaseUrl = 'https://xckveddinumudsnepkfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPhotoPairs() {
  try {
    console.log('Testing client_photo_pairs table access...');
    
    // Try to access the table
    const { data, error } = await supabase
      .from('client_photo_pairs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Error accessing client_photo_pairs table:', error);
      console.log('The table might not exist or there might be RLS issues');
    } else {
      console.log('Successfully accessed client_photo_pairs table');
      console.log('Sample data:', data);
    }
    
    // Try to check if table exists by querying the information schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('execute_sql', {
        sql: "SELECT table_name FROM information_schema.tables WHERE table_name = 'client_photo_pairs'"
      });
    
    if (tablesError) {
      console.log('Error checking table existence:', tablesError);
    } else {
      console.log('Table exists check:', tables);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testPhotoPairs();