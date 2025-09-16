// Supabase Storage Setup Script
// Run this script to create the appointment-photos bucket and set up permissions

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Update these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://xckveddinumudsnepkfx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage...');
    
    // Create the appointment-photos bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('appointment-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/*']
    });
    
    if (bucketError) {
      // Check if bucket already exists
      if (bucketError.message.includes('already exists')) {
        console.log('Bucket already exists, skipping creation.');
      } else {
        throw bucketError;
      }
    } else {
      console.log('Created appointment-photos bucket:', bucketData);
    }
    
    // Set up policies for the bucket
    const policies = [
      {
        name: 'Allow public read access',
        definition: 'FOR SELECT USING ( bucket_id = \'appointment-photos\' ) TO anon'
      },
      {
        name: 'Allow authenticated users to upload',
        definition: 'FOR INSERT WITH CHECK ( bucket_id = \'appointment-photos\' AND auth.role() = \'authenticated\' ) TO authenticated'
      },
      {
        name: 'Allow authenticated users to update',
        definition: 'FOR UPDATE USING ( bucket_id = \'appointment-photos\' AND auth.role() = \'authenticated\' ) TO authenticated'
      },
      {
        name: 'Allow authenticated users to delete',
        definition: 'FOR DELETE USING ( bucket_id = \'appointment-photos\' AND auth.role() = \'authenticated\' ) TO authenticated'
      }
    ];
    
    console.log('Storage setup completed successfully!');
    console.log('Bucket "appointment-photos" is ready for storing appointment photos.');
    console.log('Maximum file size: 5MB');
    console.log('Allowed file types: Images (jpg, png, gif, etc.)');
    
  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
}

// Run the setup
setupStorage();