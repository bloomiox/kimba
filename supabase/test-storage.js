// Simple test script for Supabase Storage
// This script tests basic storage functionality

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Update these with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xckveddinumudsnepkfx.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  try {
    console.log('Testing Supabase Storage...');
    
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Existing buckets:', buckets);
    
    // Check if appointment-photos bucket exists
    const appointmentPhotosBucket = buckets.find(bucket => bucket.name === 'appointment-photos');
    
    if (appointmentPhotosBucket) {
      console.log('✅ appointment-photos bucket exists');
      console.log('Bucket details:', appointmentPhotosBucket);
    } else {
      console.log('❌ appointment-photos bucket not found');
      console.log('Please create the bucket manually through the Supabase dashboard');
    }
    
    // Test public URL generation (if bucket exists)
    if (appointmentPhotosBucket) {
      const { data: { publicUrl } } = supabase.storage
        .from('appointment-photos')
        .getPublicUrl('test-file.jpg');
      
      console.log('Public URL generation works:', publicUrl);
    }
    
    console.log('Storage test completed!');
    
  } catch (error) {
    console.error('Error during storage test:', error);
  }
}

// Run the test
testStorage();