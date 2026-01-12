-- Migration: Convert singular category/subcategory to plural arrays
-- This updates the products table to use categories (array) instead of category (string)
-- to match the admin panel schema

-- Step 1: Add new columns for categories and subcategories as JSONB arrays
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS categories jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS subcategories jsonb DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data from singular to plural arrays
-- Convert category string to categories array (only if category is not null)
UPDATE public.products
SET categories =
  CASE
    WHEN category IS NOT NULL AND category != ''
    THEN jsonb_build_array(category)
    ELSE '[]'::jsonb
  END
WHERE categories = '[]'::jsonb;

-- Convert subcategory string to subcategories array (only if subcategory is not null)
UPDATE public.products
SET subcategories =
  CASE
    WHEN subcategory IS NOT NULL AND subcategory != ''
    THEN jsonb_build_array(subcategory)
    ELSE '[]'::jsonb
  END
WHERE subcategories = '[]'::jsonb;

-- Step 3: Add comment to explain the new columns
COMMENT ON COLUMN public.products.categories IS 'Array of category names (JSONB). Replaces singular category field.';
COMMENT ON COLUMN public.products.subcategories IS 'Array of subcategory names (JSONB). Replaces singular subcategory field.';

-- Step 4: Create indexes for better query performance on JSONB arrays
CREATE INDEX IF NOT EXISTS idx_products_categories ON public.products USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_products_subcategories ON public.products USING GIN (subcategories);

-- Step 5 (OPTIONAL): Drop old singular columns after verifying migration
-- UNCOMMENT these lines only after verifying the migration worked correctly:
-- ALTER TABLE public.products DROP COLUMN IF EXISTS category;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS subcategory;

-- Verification query - Run this to check the migration:
-- SELECT
--   id,
--   title,
--   category as old_category,
--   categories as new_categories,
--   subcategory as old_subcategory,
--   subcategories as new_subcategories
-- FROM public.products
-- WHERE category IS NOT NULL OR categories != '[]'::jsonb
-- LIMIT 10;
