// Script to check the clients table structure
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the app
const supabaseUrl = 'https://xckveddinumudsnepkfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkClientsTable() {
  try {
    console.log('Checking clients table structure...');
    
    // Try to get table information using a different approach
    const { data, error } = await supabase
      .rpc('execute_sql', {
        sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' ORDER BY ordinal_position"
      });
    
    if (error) {
      console.log('Error getting table structure:', error);
      
      // Try another approach
      console.log('Trying direct select...');
      const { data: sampleData, error: sampleError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log('Error accessing clients table:', sampleError);
      } else {
        console.log('Successfully accessed clients table');
        console.log('Sample data structure:', Object.keys(sampleData[0] || {}));
        console.log('Sample record:', sampleData[0]);
      }
    } else {
      console.log('Clients table columns:');
      data.forEach(column => {
        console.log(`- ${column.column_name}: ${column.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkClientsTable();