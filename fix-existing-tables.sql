-- Fix existing tables to work with the application

-- 1. Add user_id column to clients table if it doesn't exist
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Update existing clients to have the current user's ID (if any exist)
-- You'll need to replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- To find your user ID, run: SELECT id FROM auth.users;
-- UPDATE clients SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;

-- 3. Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy for clients
DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
CREATE POLICY "Users can manage their own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- 5. Add missing columns to clients table if they don't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Check if appointments table has user_id (it should based on the schema)
-- If not, add it:
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Enable RLS on appointments if not already enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policy for appointments
DROP POLICY IF EXISTS "Users can manage their own appointments" ON appointments;
CREATE POLICY "Users can manage their own appointments" ON appointments
  FOR ALL USING (auth.uid() = user_id);

-- Verify the changes
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'appointments')
ORDER BY table_name, ordinal_position;