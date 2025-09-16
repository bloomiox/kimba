// Migration Script for Appointment Photos
// This script migrates existing appointments with base64 photo data to Supabase storage

import { createClient } from '@supabase/supabase-js';
import { uploadImage } from '../services/imageStorageService.js';

// IMPORTANT: Update these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://xckveddinumudsnepkfx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja3ZlZGRpbnVtdWRzbmVwa2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODQ1MDIsImV4cCI6MjA3MzI2MDUwMn0.di6WmAXtqkqie6l6CFHdbQMwTZ8YebRHYEfJj7M9SJ4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to convert base64 to Blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Function to extract base64 data from data URL
function extractBase64Data(dataUrl) {
  if (!dataUrl) return null;
  
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

async function migrateAppointmentPhotos() {
  try {
    console.log('Starting appointment photos migration...');
    
    // Get all appointments with beforePhotoUrl or afterPhotoUrl
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, beforePhotoUrl, afterPhotoUrl')
      .or('beforePhotoUrl.not.is.null,afterPhotoUrl.not.is.null');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${appointments.length} appointments with photo data`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const appointment of appointments) {
      try {
        const updates = {};
        let needsUpdate = false;
        
        // Check if beforePhotoUrl is base64 data
        if (appointment.beforePhotoUrl && appointment.beforePhotoUrl.startsWith('data:')) {
          console.log(`Migrating before photo for appointment ${appointment.id}`);
          
          const base64Data = extractBase64Data(appointment.beforePhotoUrl);
          if (base64Data) {
            // Convert base64 to Blob
            const blob = base64ToBlob(base64Data.data, base64Data.mimeType);
            const file = new File([blob], `before_${appointment.id}.jpg`, { type: base64Data.mimeType });
            
            // Upload to Supabase storage
            const result = await uploadImage(file, 'appointment-photos', `before_${appointment.id}.jpg`);
            
            if (result.error) {
              console.error(`Error uploading before photo for appointment ${appointment.id}:`, result.error);
              errorCount++;
            } else {
              updates.beforePhotoUrl = result.url;
              needsUpdate = true;
              console.log(`Successfully migrated before photo for appointment ${appointment.id}`);
            }
          } else {
            console.log(`Skipping invalid before photo data for appointment ${appointment.id}`);
            skippedCount++;
          }
        }
        
        // Check if afterPhotoUrl is base64 data
        if (appointment.afterPhotoUrl && appointment.afterPhotoUrl.startsWith('data:')) {
          console.log(`Migrating after photo for appointment ${appointment.id}`);
          
          const base64Data = extractBase64Data(appointment.afterPhotoUrl);
          if (base64Data) {
            // Convert base64 to Blob
            const blob = base64ToBlob(base64Data.data, base64Data.mimeType);
            const file = new File([blob], `after_${appointment.id}.jpg`, { type: base64Data.mimeType });
            
            // Upload to Supabase storage
            const result = await uploadImage(file, 'appointment-photos', `after_${appointment.id}.jpg`);
            
            if (result.error) {
              console.error(`Error uploading after photo for appointment ${appointment.id}:`, result.error);
              errorCount++;
            } else {
              updates.afterPhotoUrl = result.url;
              needsUpdate = true;
              console.log(`Successfully migrated after photo for appointment ${appointment.id}`);
            }
          } else {
            console.log(`Skipping invalid after photo data for appointment ${appointment.id}`);
            skippedCount++;
          }
        }
        
        // Update appointment if needed
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', appointment.id);
          
          if (updateError) {
            console.error(`Error updating appointment ${appointment.id}:`, updateError);
            errorCount++;
          } else {
            migratedCount++;
          }
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('Migration completed!');
    console.log(`Successfully migrated: ${migratedCount} appointments`);
    console.log(`Skipped: ${skippedCount} appointments`);
    console.log(`Errors: ${errorCount} appointments`);
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateAppointmentPhotos();