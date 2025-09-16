-- Create client_photo_pairs table
CREATE TABLE IF NOT EXISTS client_photo_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
  before_photo_url TEXT,
  after_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_photo_pairs_client_id ON client_photo_pairs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_photo_pairs_created_at ON client_photo_pairs(created_at);

-- Enable Row Level Security
ALTER TABLE client_photo_pairs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own client photo pairs" ON client_photo_pairs
  FOR ALL USING (auth.uid() = user_id);