# Database Migration Plan: JSONB to Separate Tables

## Current Architecture
- `user_profiles` table with JSONB `settings` field containing:
  - services, hairstylists, products, sales, coupons, segments, etc.
- Separate tables: `clients`, `appointments`, `lookbooks`

## Step 1: Check Existing Tables
First, let's see what tables already exist:
```sql
-- Check existing table structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

## Step 2: Create New Tables (Run in Order)

### Phase 1: Core Tables (No Dependencies)

```sql
-- 1. Services table (independent)
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

-- 2. Hairstylists table (independent)
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

-- 3. Products table (independent)
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
```

### Phase 2: Relationship Tables (Depend on Phase 1)

```sql
-- 4. Hairstylist availability (depends on hairstylists)
CREATE TABLE IF NOT EXISTS hairstylist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hairstylist_id UUID REFERENCES hairstylists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Hairstylist services (many-to-many)
CREATE TABLE IF NOT EXISTS hairstylist_services (
  hairstylist_id UUID REFERENCES hairstylists(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (hairstylist_id, service_id)
);

-- 6. Sales table (depends on clients and hairstylists)
-- Note: Only create if clients table exists, otherwise remove the foreign key
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID, -- Will add foreign key constraint later if clients table exists
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

-- 7. Sale items (depends on sales)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
  item_id UUID NOT NULL, -- References services.id or products.id
  item_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Phase 3: Add Foreign Key Constraints (If Tables Exist)

```sql
-- Add foreign key to sales.client_id if clients table exists
-- Check first if clients table exists and has id column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'clients'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'id'
    ) THEN
        ALTER TABLE sales 
        ADD CONSTRAINT fk_sales_client 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
END $$;
```

### Phase 4: Create Indexes for Performance

```sql
-- Indexes for better query performance
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
```

### Phase 5: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstylist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstylist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
```

### Phase 2: Keep in JSONB (Configuration Data)
- User preferences (theme, language, etc.)
- Marketing data (coupons, segments, campaigns)
- Menu customization
- Social media connections

## Benefits of Separate Tables

### Services Table Benefits:
- ✅ Data validation (price > 0, duration > 0)
- ✅ Service categories with foreign keys
- ✅ Better reporting on service usage
- ✅ Can track service performance metrics

### Hairstylists Table Benefits:
- ✅ Better availability management
- ✅ Performance tracking over time
- ✅ Skills and commission tracking
- ✅ Better integration with scheduling

### Products Table Benefits:
- ✅ Inventory tracking (stock levels, reorder points)
- ✅ Supplier management
- ✅ Purchase history
- ✅ Better POS integration

### Sales Table Benefits:
- ✅ **CRITICAL** - Proper audit trail
- ✅ Financial reporting and analytics
- ✅ Tax compliance
- ✅ Integration with accounting systems

## Migration Strategy

1. **Test the race condition fix first** - might solve current issues
2. **Create new tables alongside existing JSONB**
3. **Migrate data gradually** - services first, then hairstylists
4. **Update application code** to use new tables
5. **Remove JSONB fields** once migration is complete

## Recommendation

**For immediate fix:** Use the race condition fix I implemented
**For production:** Migrate to separate tables, especially for sales data