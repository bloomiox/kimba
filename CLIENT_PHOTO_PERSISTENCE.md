# Client Photo Persistence Implementation

## Overview
This implementation adds persistence for client before/after photos so they don't disappear after a browser refresh. The solution involves:

1. Adding new columns to the clients table in the database
2. Updating the Client interface to include these new fields
3. Modifying the ClientDetailPage component to persist photos to the database

## Changes Made

### 1. Database Schema Update
Added `before_photo_url` and `after_photo_url` columns to the `clients` table:

```sql
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS before_photo_url TEXT,
ADD COLUMN IF NOT EXISTS after_photo_url TEXT;
```

### 2. Type Definition Update
Updated the Client interface in `types.ts` to include the new photo URL fields:

```typescript
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  address?: string;
  notes?: string;
  createdAt: string; // ISO date string
  isDemo?: boolean;
  consentToShare?: boolean;
  socialMediaConsent?: ClientSocialConsent;
  beforePhotoUrl?: string; // URL to before photo (stored in Supabase Storage)
  afterPhotoUrl?: string; // URL to after photo (stored in Supabase Storage)
}
```

### 3. Component Updates
Modified `components/clients/ClientDetailPage.tsx` to:
- Load client photos when the component mounts
- Persist photos to the database when saved

## Database Migration

To apply the database changes, you need to run the migration script:

### Option 1: Using SQL (Recommended)
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run the following SQL script:

```sql
-- Add before_photo_url and after_photo_url columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS before_photo_url TEXT,
ADD COLUMN IF NOT EXISTS after_photo_url TEXT;

-- Verify the changes
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clients'
AND column_name IN ('before_photo_url', 'after_photo_url')
ORDER BY column_name;
```

### Option 2: Using Node.js Script
1. Update the credentials in `supabase/migrate-client-photos.js`:
   - Replace `YOUR_SUPABASE_URL` with your actual Supabase URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your actual Supabase anon key

2. Run the migration script:
```bash
node supabase/migrate-client-photos.js
```

## Testing the Implementation

1. Navigate to the Clients page
2. Select a client to view their details
3. Click the "Take Photos" button
4. Capture or upload before/after photos
5. Click "Save Photos to Profile"
6. Refresh the browser
7. The photos should still be visible in the "Client Photos" section

## Troubleshooting

If photos still disappear after a refresh:

1. Verify the database migration was successful by checking that the columns exist:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'clients' 
   AND column_name IN ('before_photo_url', 'after_photo_url');
   ```

2. Check the browser console for any errors during photo saving

3. Ensure the Supabase client has the necessary permissions to update the clients table