# Supabase Storage Setup for Appointment Photos

This document explains how to set up Supabase Storage for storing appointment before/after photos in the HairstylistCRM application.

## Overview

The application now uses Supabase Storage to store appointment photos instead of saving base64 data directly in the database. This approach:

- Reduces database size
- Improves performance
- Enables better image management
- Allows for image optimization features

## Manual Setup Instructions

### 1. Create the Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage → Buckets
3. Click "New Bucket"
4. Enter the following details:
   - Name: `appointment-photos`
   - Public access: Enabled
5. Click "Create bucket"

### 2. Configure Bucket Settings

1. Click on the `appointment-photos` bucket
2. Go to Settings tab
3. Set the following limits:
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

### 3. Set Up Storage Policies

Add the following policies to the bucket:

1. **Public read access** (for displaying images):
   ```sql
   CREATE POLICY "Public read access for appointment photos"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'appointment-photos');
   ```

2. **Authenticated users can upload**:
   ```sql
   CREATE POLICY "Authenticated users can upload appointment photos"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'appointment-photos' AND auth.role() = 'authenticated');
   ```

3. **Authenticated users can update**:
   ```sql
   CREATE POLICY "Authenticated users can update appointment photos"
   ON storage.objects FOR UPDATE
   USING (bucket_id = 'appointment-photos' AND auth.role() = 'authenticated');
   ```

4. **Authenticated users can delete**:
   ```sql
   CREATE POLICY "Authenticated users can delete appointment photos"
   ON storage.objects FOR DELETE
   USING (bucket_id = 'appointment-photos' AND auth.role() = 'authenticated');
   ```

### 4. Enable Row Level Security

Make sure RLS is enabled on the storage.objects table:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Environment Variables

Make sure your `.env` file includes the Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How It Works

### Image Upload Process

1. When a user captures or uploads a photo in the appointment modal:
   - The image file is sent to the `uploadImage` service
   - The service uploads the file to the `appointment-photos` bucket
   - A public URL is generated and returned

2. The public URL is stored in the appointment record:
   - `beforePhotoUrl` for before photos
   - `afterPhotoUrl` for after photos

### Image Display

1. Client detail pages fetch appointments with photo URLs
2. Images are displayed directly using the public URLs
3. Error handling is implemented to show a placeholder if an image fails to load

### Image Deletion

When a user removes a photo:
- The image is deleted from Supabase Storage
- The URL is removed from the appointment record

## Storage Structure

```
appointment-photos/
├── appointment-{id}-before.jpg
├── appointment-{id}-after.jpg
└── ... (other appointment photos)
```

## Security Considerations

- Only authenticated users can upload/delete images
- Public read access is allowed for displaying images
- File size and type restrictions are enforced
- Unique filenames prevent conflicts

## Troubleshooting

### Bucket Creation Issues

If you encounter errors during bucket creation:
1. Check your Supabase credentials in `.env`
2. Ensure you have the necessary permissions
3. Verify the bucket doesn't already exist with different settings

### Image Upload Failures

If images fail to upload:
1. Check the file size (must be < 5MB)
2. Verify the file type is an image
3. Ensure you have a stable internet connection
4. Check the browser console for detailed error messages

### Image Display Issues

If images don't display properly:
1. Verify the URLs are correct
2. Check that the bucket is public
3. Ensure the files exist in storage
4. Look for CORS issues in the browser console

## Maintenance

### Storage Cleanup

Periodically review storage usage:
1. Check for orphaned files (images without corresponding appointments)
2. Monitor storage quotas
3. Remove unused files to optimize costs

### Backup Strategy

Consider implementing a backup strategy for important images:
1. Regular exports of the storage bucket
2. Versioning for critical before/after comparisons
3. Off-site backups for disaster recovery