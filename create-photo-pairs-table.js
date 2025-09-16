// Script to create the client_photo_pairs table
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the app
const supabaseUrl = 'https://xckveddinumudsnepkfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL to create the client_photo_pairs table
const createTableSQL = `
-- Create client_photo_pairs table
CREATE TABLE IF NOT EXISTS client_photo_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  before_photo_url TEXT,
  after_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_photo_pairs_client_id ON client_photo_pairs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_photo_pairs_created_at ON client_photo_pairs(created_at);

-- Enable Row Level Security
ALTER TABLE client_photo_pairs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own client photo pairs" ON client_photo_pairs
  FOR ALL USING (auth.uid() = user_id);
`;

async function createTable() {
  try {
    console.log('Creating client_photo_pairs table...');
    
    // Since we can't execute raw SQL directly with the JS client,
    // we'll need to use the Supabase dashboard or CLI to run this.
    // For now, let's just output the SQL that needs to be run.
    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log(createTableSQL);
    
    // Alternative approach: Try to create a test record to see if the table exists
    const { data, error } = await supabase
      .from('client_photo_pairs')
      .insert({
        client_id: 'test-client-id',
        before_photo_url: 'https://example.com/before.jpg',
        after_photo_url: 'https://example.com/after.jpg',
        user_id: 'test-user-id'
      })
      .select();
    
    if (error) {
      console.log('Error inserting test record:', error);
      console.log('This confirms the table does not exist yet.');
    } else {
      console.log('Successfully inserted test record:', data);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTable();