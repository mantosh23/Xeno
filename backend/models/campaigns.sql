-- Run this in your Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/zzqnsrqfrkfkgzvifsjp/sql

CREATE TABLE IF NOT EXISTS campaigns (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL DEFAULT 'Untitled Campaign',
  goal              TEXT,
  audience_size     INT DEFAULT 0,
  potential_revenue DECIMAL(14, 2) DEFAULT 0,
  offer             VARCHAR(255),
  channels          TEXT[],          -- array of channel names
  strategy          JSONB,           -- full AI strategy object
  status            VARCHAR(50) DEFAULT 'Active',  -- Draft | Active | Paused | Completed
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by status
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
