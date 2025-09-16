-- Full table inspection script to understand the database structure

-- 1. Check the clients table structure
SELECT 
    'clients' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 2. Check the appointments table structure
SELECT 
    'appointments' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 3. Check if client_photo_pairs table exists
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_name = 'client_photo_pairs';

-- 4. Check auth.users table structure (simplified)
SELECT 
    'auth.users' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'id'
ORDER BY ordinal_position;