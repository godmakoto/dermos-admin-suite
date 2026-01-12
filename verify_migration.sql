-- Verification script after migrating from category to categories
-- Run these queries to verify the migration was successful

-- Query 1: Check if new columns exist and have data
SELECT
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE categories != '[]'::jsonb) as products_with_categories,
  COUNT(*) FILTER (WHERE subcategories != '[]'::jsonb) as products_with_subcategories,
  COUNT(*) FILTER (WHERE category IS NOT NULL) as products_with_old_category
FROM public.products;

-- Query 2: Compare old and new fields side by side
SELECT
  id,
  title,
  category as old_category,
  categories as new_categories,
  subcategory as old_subcategory,
  subcategories as new_subcategories,
  updated_at
FROM public.products
WHERE category IS NOT NULL OR categories != '[]'::jsonb
ORDER BY updated_at DESC
LIMIT 20;

-- Query 3: Test filtering by "Labios" category using the new array field
SELECT
  id,
  product_id,
  title,
  categories,
  subcategories,
  regular_price,
  offer_price
FROM public.products
WHERE categories @> '["Labios"]'::jsonb
ORDER BY created_at DESC;

-- Query 4: Count products by category (using new array field)
SELECT
  jsonb_array_elements_text(categories) as category_name,
  COUNT(*) as product_count
FROM public.products
WHERE categories != '[]'::jsonb
GROUP BY jsonb_array_elements_text(categories)
ORDER BY product_count DESC;

-- Query 5: Find products with multiple categories (will be 0 if migrated from singular)
SELECT
  id,
  title,
  jsonb_array_length(categories) as num_categories,
  categories
FROM public.products
WHERE jsonb_array_length(categories) > 1
ORDER BY num_categories DESC;

-- Query 6: Check indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'products'
  AND (indexname = 'idx_products_categories' OR indexname = 'idx_products_subcategories');

-- Query 7: Performance test - Search products by category (should use GIN index)
EXPLAIN ANALYZE
SELECT id, title, categories
FROM public.products
WHERE categories @> '["Labios"]'::jsonb;
