-- Verification script to check if product changes are in Supabase
-- Run this in Supabase SQL Editor to verify your changes were saved

-- Query 1: Check all products with category "Labios"
SELECT
  id,
  product_id,
  title,
  brand,
  categories,
  subcategories,
  price,
  created_at,
  updated_at
FROM public.products
WHERE categories::text LIKE '%Labios%'
ORDER BY updated_at DESC;

-- Query 2: Count products by category
SELECT
  jsonb_array_elements_text(categories) as category_name,
  COUNT(*) as product_count
FROM public.products
WHERE categories != '[]'::jsonb
GROUP BY jsonb_array_elements_text(categories)
ORDER BY product_count DESC;

-- Query 3: Show recently updated products (last 24 hours)
SELECT
  id,
  product_id,
  title,
  categories,
  subcategories,
  updated_at
FROM public.products
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;

-- Query 4: Show products with empty categories
SELECT
  COUNT(*) FILTER (WHERE categories = '[]'::jsonb OR categories IS NULL) as without_categories,
  COUNT(*) FILTER (WHERE categories != '[]'::jsonb AND categories IS NOT NULL) as with_categories,
  COUNT(*) as total
FROM public.products;
