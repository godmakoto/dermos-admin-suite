-- Clean up products with old/invalid categories
-- This migration removes old mock categories from existing products

-- Step 1: Update products that have old categories to empty arrays
UPDATE public.products
SET
  categories = '[]'::jsonb,
  subcategories = '[]'::jsonb
WHERE
  -- Check if the product has any of the old mock categories
  categories::text LIKE '%Cuidado Facial%'
  OR categories::text LIKE '%Cuidado Corporal%'
  OR categories::text LIKE '%Protección Solar%'
  OR categories::text LIKE '%Anti-Edad%'
  OR categories::text LIKE '%cuidado facial%'
  OR categories::text LIKE '%cuidado corporal%';

-- Step 2: Also clear any products with invalid/unknown categories
-- This ensures all products start fresh and can be recategorized properly
UPDATE public.products
SET
  categories = '[]'::jsonb,
  subcategories = '[]'::jsonb
WHERE
  -- If categories is not empty and doesn't match any valid category
  categories != '[]'::jsonb
  AND NOT (
    categories::text LIKE '%Limpiadores%' OR
    categories::text LIKE '%Hidratantes Faciales%' OR
    categories::text LIKE '%Hidratantes Corporales%' OR
    categories::text LIKE '%Protectores Solares%' OR
    categories::text LIKE '%Serums%' OR
    categories::text LIKE '%Exfoliantes faciales%' OR
    categories::text LIKE '%Exfoliantes Corporales%' OR
    categories::text LIKE '%Desmaquillantes%' OR
    categories::text LIKE '%Tónicos y Esencias%' OR
    categories::text LIKE '%Agua Termal y Mist%' OR
    categories::text LIKE '%Capilar%' OR
    categories::text LIKE '%Maquillaje%' OR
    categories::text LIKE '%Kits%' OR
    categories::text LIKE '%Labios%' OR
    categories::text LIKE '%Mascarillas%'
  );

-- Step 3: Show summary of cleaned products
SELECT
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE categories = '[]'::jsonb) as products_without_categories,
  COUNT(*) FILTER (WHERE categories != '[]'::jsonb) as products_with_categories
FROM public.products;

-- Add comment
COMMENT ON COLUMN public.products.categories IS
  'Product categories (JSONB array). Must match categories from the categories table. Valid values: Limpiadores, Hidratantes Faciales, Hidratantes Corporales, Protectores Solares, Serums, Exfoliantes faciales, Exfoliantes Corporales, Desmaquillantes, Tónicos y Esencias, Agua Termal y Mist, Capilar, Maquillaje, Kits, Labios, Mascarillas';

COMMENT ON COLUMN public.products.subcategories IS
  'Product subcategories (JSONB array). Must match subcategories from the subcategories table for the selected categories.';
