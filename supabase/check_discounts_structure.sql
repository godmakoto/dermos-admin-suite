-- Verificar la estructura de descuentos en pedidos recientes
SELECT
  order_number,
  customer_name,
  discount as descuento_adicional_manual,
  product_discounts as descuentos_automaticos_productos,
  subtotal,
  total,
  created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;
