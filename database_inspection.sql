-- Database Inspection Script for Revenue Chart Issue
-- Run these queries in your Supabase SQL Editor to understand the current state

-- 1. Check if you're authenticated and get your user ID
SELECT auth.uid() as current_user_id;

-- 2. Check your user profile
SELECT id, salon_name, created_at 
FROM user_profiles 
WHERE id = auth.uid();

-- 3. Check existing hairstylists
SELECT id, name, is_active, created_at 
FROM hairstylists 
WHERE user_id = auth.uid();

-- 4. Check existing clients  
SELECT id, name, created_at 
FROM clients 
WHERE user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check existing sales (this is likely empty or sparse)
SELECT 
    id,
    total,
    created_at,
    payment_method,
    hairstylist_id,
    client_id
FROM sales 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 6. Check sales in the last 7 days specifically
SELECT 
    created_at::date as sale_date,
    SUM(total) as daily_total,
    COUNT(*) as sale_count
FROM sales 
WHERE user_id = auth.uid() 
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY created_at::date
ORDER BY sale_date;

-- 7. Check if there are any sales at all
SELECT COUNT(*) as total_sales_count
FROM sales 
WHERE user_id = auth.uid();

-- 8. Check date range of existing sales
SELECT 
    MIN(created_at) as earliest_sale,
    MAX(created_at) as latest_sale,
    COUNT(*) as total_count
FROM sales 
WHERE user_id = auth.uid();

-- 9. Get sample IDs for creating test data
SELECT 
    'User ID: ' || auth.uid() as user_info
UNION ALL
SELECT 
    'Hairstylist ID: ' || id || ' (Name: ' || name || ')'
FROM hairstylists 
WHERE user_id = auth.uid() 
LIMIT 1
UNION ALL
SELECT 
    'Client ID: ' || id || ' (Name: ' || name || ')'
FROM clients 
WHERE user_id = auth.uid() 
LIMIT 1;