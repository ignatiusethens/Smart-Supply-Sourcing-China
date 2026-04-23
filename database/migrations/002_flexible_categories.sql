-- Migration: Replace hardcoded category CHECK constraint with a flexible categories table
-- Run this against your Supabase/Postgres database

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Seed with existing categories
INSERT INTO product_categories (slug, label, sort_order) VALUES
  ('pumps-motors',   'Pumps & Motors',   1),
  ('energy-systems', 'Energy Systems',   2),
  ('fluid-control',  'Fluid Control',    3),
  ('electrical',     'Electrical',       4),
  ('storage',        'Storage',          5)
ON CONFLICT (slug) DO NOTHING;

-- 3. Drop the old CHECK constraint on products.category
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- 4. Add a soft FK (no hard constraint so old data is safe)
-- category column stays VARCHAR(50), values must match product_categories.slug
