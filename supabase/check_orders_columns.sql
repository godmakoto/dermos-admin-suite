-- Ver todas las columnas y valores de los pedidos actuales
SELECT
  id,
  order_number,
  customer_name,
  customer_phone,
  customer_email,
  customer_address,
  items,
  subtotal,
  discount,
  product_discounts,
  total,
  status_id,
  notes,
  payment_method,
  created_at,
  updated_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;

-- Ver qué columnas tienen valores NULL en la mayoría de pedidos
SELECT
  COUNT(*) as total_pedidos,
  COUNT(customer_name) as con_nombre,
  COUNT(customer_phone) as con_telefono,
  COUNT(customer_email) as con_email,
  COUNT(customer_address) as con_direccion,
  COUNT(notes) as con_notas,
  COUNT(payment_method) as con_metodo_pago,
  COUNT(CASE WHEN discount > 0 THEN 1 END) as con_descuento_manual,
  COUNT(CASE WHEN product_discounts > 0 THEN 1 END) as con_descuento_productos
FROM public.orders;
