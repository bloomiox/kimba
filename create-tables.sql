-- Salon Management System - Database Tables Creation
-- Run these commands in your Supabase SQL Editor

-- Step 1: Check existing tables
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- Step 2: Create core tables (no dependencies)

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL CHECK (duration > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  parent_id UUID REFERENCES services(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hairstylists table
CREATE TABLE IF NOT EXISTS hairstylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expert', 'station')),
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost_price DECIMAL(10,2),
  in_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  category TEXT,
  brand TEXT,
  sku TEXT,
  barcode TEXT,
  supplier TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create relationship tables

-- Hairstylist availability
CREATE TABLE IF NOT EXISTS hairstylist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hairstylist_id UUID REFERENCES hairstylists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hairstylist services (many-to-many)
CREATE TABLE IF NOT EXISTS hairstylist_services (
  hairstylist_id UUID REFERENCES hairstylists(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (hairstylist_id, service_id)
);

-- Sales table (references existing clients table)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  hairstylist_id UUID REFERENCES hairstylists(id) ON DELETE SET NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_reason TEXT,
  vat_rate DECIMAL(5,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL,
  tip DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Update existing appointments table to use UUID foreign keys (optional)
-- Note: This will convert existing TEXT service_id and hairstylist_id to UUID references
-- Only run this if you want to link existing appointments to the new tables

-- First, you might want to backup existing data:
-- CREATE TABLE appointments_backup AS SELECT * FROM appointments;

-- Then update the appointments table structure (OPTIONAL - only if you want to link existing data):
-- ALTER TABLE appointments ALTER COLUMN service_id TYPE UUID USING service_id::UUID;
-- ALTER TABLE appointments ALTER COLUMN hairstylist_id TYPE UUID USING hairstylist_id::UUID;
-- ALTER TABLE appointments ADD CONSTRAINT fk_appointments_service FOREIGN KEY (service_id) REFERENCES services(id);
-- ALTER TABLE appointments ADD CONSTRAINT fk_appointments_hairstylist FOREIGN KEY (hairstylist_id) REFERENCES hairstylists(id);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_parent_id ON services(parent_id);
CREATE INDEX IF NOT EXISTS idx_hairstylists_user_id ON hairstylists(user_id);
CREATE INDEX IF NOT EXISTS idx_hairstylists_active ON hairstylists(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_hairstylist_availability_hairstylist ON hairstylist_availability(hairstylist_id);

-- Step 6: Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstylist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstylist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "Users can manage their own services" ON services
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own hairstylists" ON hairstylists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own products" ON products
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own hairstylist availability" ON hairstylist_availability
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM hairstylists WHERE id = hairstylist_id));

CREATE POLICY "Users can manage their own hairstylist services" ON hairstylist_services
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM hairstylists WHERE id = hairstylist_id));

CREATE POLICY "Users can manage their own sales" ON sales
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sale items" ON sale_items
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM sales WHERE id = sale_id));

-- Verification: Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('services', 'hairstylists', 'products', 'hairstylist_availability', 'hairstylist_services', 'sales', 'sale_items')
ORDER BY table_name;