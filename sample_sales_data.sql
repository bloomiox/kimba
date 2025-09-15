-- Sample Sales Data for Revenue Chart Testing
-- Run this in your Supabase SQL Editor to add test sales data

-- First, let's check what user_id, hairstylist_id, and client_id values exist
-- SELECT id, salon_name FROM user_profiles LIMIT 5;
-- SELECT id, name FROM hairstylists LIMIT 5;
-- SELECT id, name FROM clients LIMIT 5;

-- Replace these UUIDs with actual values from your database:
-- user_id: Get from user_profiles table
-- hairstylist_id: Get from hairstylists table  
-- client_id: Get from clients table (can be NULL for walk-ins)

-- Sample sales for the last 7 days
INSERT INTO sales (
    user_id,
    client_id, 
    hairstylist_id,
    subtotal,
    discount_amount,
    vat_rate,
    vat_amount,
    tip,
    total,
    payment_method,
    created_at
) VALUES 
    -- Today
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 65.00, 0, 7.7, 5.01, 8.00, 78.01, 'card', NOW()),
    ('YOUR_USER_ID', NULL, 'YOUR_HAIRSTYLIST_ID', 45.00, 0, 7.7, 3.47, 5.00, 53.47, 'cash', NOW()),
    
    -- Yesterday  
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 85.00, 0, 7.7, 6.55, 12.00, 103.55, 'card', NOW() - INTERVAL '1 day'),
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 120.00, 10.00, 7.7, 8.47, 15.00, 133.47, 'card', NOW() - INTERVAL '1 day'),
    
    -- 2 days ago
    ('YOUR_USER_ID', NULL, 'YOUR_HAIRSTYLIST_ID', 75.00, 0, 7.7, 5.78, 10.00, 90.78, 'cash', NOW() - INTERVAL '2 days'),
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 95.00, 5.00, 7.7, 6.93, 12.00, 102.93, 'card', NOW() - INTERVAL '2 days'),
    
    -- 3 days ago
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 55.00, 0, 7.7, 4.24, 7.00, 66.24, 'card', NOW() - INTERVAL '3 days'),
    
    -- 4 days ago
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 110.00, 0, 7.7, 8.47, 18.00, 136.47, 'card', NOW() - INTERVAL '4 days'),
    ('YOUR_USER_ID', NULL, 'YOUR_HAIRSTYLIST_ID', 40.00, 0, 7.7, 3.08, 5.00, 48.08, 'cash', NOW() - INTERVAL '4 days'),
    
    -- 5 days ago
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 80.00, 0, 7.7, 6.16, 10.00, 96.16, 'card', NOW() - INTERVAL '5 days'),
    
    -- 6 days ago
    ('YOUR_USER_ID', 'YOUR_CLIENT_ID', 'YOUR_HAIRSTYLIST_ID', 70.00, 0, 7.7, 5.39, 8.00, 83.39, 'card', NOW() - INTERVAL '6 days'),
    ('YOUR_USER_ID', NULL, 'YOUR_HAIRSTYLIST_ID', 35.00, 0, 7.7, 2.70, 4.00, 41.70, 'cash', NOW() - INTERVAL '6 days');

-- Sample sale items for the above sales
-- Replace sale_id values with the actual IDs from the sales you just inserted
-- You can get these by running: SELECT id, total, created_at FROM sales ORDER BY created_at DESC LIMIT 12;

-- Example sale items (you'll need to update the sale_id values):
/*
INSERT INTO sale_items (
    sale_id,
    item_type,
    item_id, 
    item_name,
    price,
    quantity
) VALUES 
    ('SALE_ID_1', 'service', 'service_1', 'Haircut & Style', 45.00, 1),
    ('SALE_ID_2', 'service', 'service_1', 'Haircut & Style', 45.00, 1),
    ('SALE_ID_3', 'service', 'service_2', 'Hair Color', 85.00, 1),
    -- ... add more items as needed
;
*/

-- To verify the data was inserted correctly:
SELECT 
    s.total,
    s.created_at::date as sale_date,
    s.payment_method,
    h.name as hairstylist_name,
    c.name as client_name
FROM sales s
LEFT JOIN hairstylists h ON s.hairstylist_id = h.id  
LEFT JOIN clients c ON s.client_id = c.id
WHERE s.created_at >= NOW() - INTERVAL '7 days'
ORDER BY s.created_at DESC;

-- Check daily totals for the chart:
SELECT 
    s.created_at::date as sale_date,
    SUM(s.total) as daily_total,
    COUNT(*) as sale_count
FROM sales s
WHERE s.created_at >= NOW() - INTERVAL '7 days'
GROUP BY s.created_at::date
ORDER BY sale_date;