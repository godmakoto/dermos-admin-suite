-- Script to fix orders with incorrect discount values
-- This corrects orders created from the web that should have discount = 0

-- Step 1: Check orders with non-zero discount that were created from web
-- (identified by customer_name = 'Cliente Web')
SELECT
  order_number,
  customer_name,
  discount,
  subtotal,
  total,
  created_at
FROM public.orders
WHERE customer_name = 'Cliente Web'
  AND discount > 0
ORDER BY created_at DESC;

-- Step 2: If the above query shows orders that shouldn't have discount,
-- run this UPDATE to set discount to 0
/*
UPDATE public.orders
SET
  discount = 0,
  updated_at = NOW()
WHERE customer_name = 'Cliente Web'
  AND discount > 0;
*/

-- Step 3: Verify the update
/*
SELECT
  order_number,
  customer_name,
  discount,
  subtotal,
  total
FROM public.orders
WHERE customer_name = 'Cliente Web'
ORDER BY created_at DESC;
*/

-- IMPORTANT NOTE:
-- Only run the UPDATE if you're sure that web orders should NOT have
-- additional discount. If some web orders legitimately have discounts,
-- you'll need to review each one manually.
