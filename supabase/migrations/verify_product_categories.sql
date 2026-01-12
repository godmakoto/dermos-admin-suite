-- Verification query to check current product categories
-- Run this BEFORE the cleanup migration to see what needs to be fixed

-- Query 1: Count products by category
SELECT
  jsonb_array_elements_text(categories) as category_name,
  COUNT(*) as product_count
FROM public.products
WHERE categories != '[]'::jsonb
GROUP BY jsonb_array_elements_text(categories)
ORDER BY product_count DESC;

-- Query 2: Find products with old/invalid categories
SELECT
  id,
  title,
  categories,
  subcategories
FROM public.products
WHERE
  categories::text LIKE '%Cuidado Facial%'
  OR categories::text LIKE '%Cuidado Corporal%'
  OR categories::text LIKE '%Protección Solar%'
  OR categories::text LIKE '%Anti-Edad%'
  OR categories::text LIKE '%cuidado facial%'
  OR categories::text LIKE '%cuidado corporal%'
LIMIT 20;

-- Query 3: Count products without categories
SELECT
  COUNT(*) FILTER (WHERE categories = '[]'::jsonb OR categories IS NULL) as without_categories,
  COUNT(*) FILTER (WHERE categories != '[]'::jsonb AND categories IS NOT NULL) as with_categories,
  COUNT(*) as total
FROM public.products;

-- Query 4: Show all unique category values currently in use
SELECT DISTINCT
  jsonb_array_elements_text(categories) as category_in_use
FROM public.products
WHERE categories != '[]'::jsonb
ORDER BY category_in_use;
