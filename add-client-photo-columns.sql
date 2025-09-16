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