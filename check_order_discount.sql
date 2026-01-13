-- Query to check the discount value of the order
SELECT 
  order_number,
  customer_name,
  discount,
  subtotal,
  total,
  items
FROM public.orders
WHERE order_number = 'ORD-20260113-004500432';
