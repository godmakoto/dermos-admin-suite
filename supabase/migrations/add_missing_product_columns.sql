-- Add missing columns to products table
-- This migration adds all the fields that are used in the frontend but missing in the database

-- Add basic product information columns
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS label text,
ADD COLUMN IF NOT EXISTS carousel_state text,
ADD COLUMN IF NOT EXISTS track_stock boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add categories as a JSON array (can store multiple categories)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS categories jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS subcategories jsonb DEFAULT '[]'::jsonb;

-- Add a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists (to avoid errors on re-run)
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

-- Create the trigger
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the columns
COMMENT ON COLUMN public.products.short_description IS 'Brief description of the product';
COMMENT ON COLUMN public.products.brand IS 'Brand name of the product';
COMMENT ON COLUMN public.products.label IS 'Product label or property (e.g., Nuevo, Popular, etc.)';
COMMENT ON COLUMN public.products.carousel_state IS 'State of the product in carousel (e.g., featured, banner)';
COMMENT ON COLUMN public.products.track_stock IS 'Whether to track stock for this product';
COMMENT ON COLUMN public.products.stock IS 'Current stock quantity (only relevant if track_stock is true)';
COMMENT ON COLUMN public.products.categories IS 'Array of category names (stored as JSON)';
COMMENT ON COLUMN public.products.subcategories IS 'Array of subcategory names (stored as JSON)';
COMMENT ON COLUMN public.products.updated_at IS 'Timestamp of last update';
