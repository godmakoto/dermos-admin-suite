-- Migration: Add product_discounts column to separate automatic discounts from manual discounts
-- This makes the discount structure more explicit and clear

-- Step 1: Add new column for product discounts (automatic discounts from sale prices)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS product_discounts numeric DEFAULT 0;

-- Step 2: Add comment to clarify the purpose of each discount field
COMMENT ON COLUMN public.orders.discount IS 'Descuento adicional manual aplicado al pedido';
COMMENT ON COLUMN public.orders.product_discounts IS 'Suma de descuentos automáticos de productos con precio de oferta';

-- Step 3: Update existing orders to calculate and store product_discounts
-- This is a one-time migration to populate the new column with correct values
-- Note: This assumes items JSONB has the structure with product_id, price, quantity

-- For now, we'll set product_discounts to 0 for existing orders
-- You'll need to manually calculate and update if needed, or the admin panel will
-- recalculate when orders are edited

UPDATE public.orders
SET product_discounts = 0
WHERE product_discounts IS NULL;

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_product_discounts ON public.orders(product_discounts);

-- Verification query:
-- SELECT
--   order_number,
--   discount as additional_discount,
--   product_discounts as automatic_discounts,
--   subtotal,
--   total,
--   (subtotal - product_discounts - discount) as calculated_total
-- FROM public.orders
-- ORDER BY created_at DESC
-- LIMIT 10;
