-- ============================================
-- Script completo para configurar estados de carrusel
-- y asignarlos a 40 productos aleatorios
-- ============================================

-- PASO 1: Crear los estados si no existen
-- ============================================

-- Insertar estados solo si no existen
INSERT INTO public.product_carousel_states (name, type, color)
VALUES
  ('Destacados', 'carousel', '#f59e0b'),
  ('Vuelta en stock', 'carousel', '#10b981'),
  ('En oferta', 'banner', '#ef4444'),
  ('Más vendidos', 'carousel', '#8b5cf6')
ON CONFLICT (name) DO NOTHING;

-- Verificar estados creados
SELECT id, name, type, color FROM public.product_carousel_states
WHERE name IN ('Destacados', 'Vuelta en stock', 'En oferta', 'Más vendidos')
ORDER BY name;

-- ============================================
-- PASO 2: Limpiar asignaciones anteriores (OPCIONAL)
-- ============================================
-- Descomentar la siguiente línea si quieres limpiar todas las asignaciones
-- UPDATE public.products SET carousel_state = NULL;

-- ============================================
-- PASO 3: Asignar productos a cada estado
-- ============================================

-- Asignar 10 productos aleatorios a "Destacados"
WITH random_products AS (
  SELECT id
  FROM public.products
  WHERE carousel_state IS NULL OR carousel_state = ''
  ORDER BY RANDOM()
  LIMIT 10
)
UPDATE public.products
SET carousel_state = 'Destacados'
WHERE id IN (SELECT id FROM random_products);

-- Asignar 10 productos aleatorios a "Vuelta en stock"
WITH random_products AS (
  SELECT id
  FROM public.products
  WHERE carousel_state IS NULL OR carousel_state = ''
  ORDER BY RANDOM()
  LIMIT 10
)
UPDATE public.products
SET carousel_state = 'Vuelta en stock'
WHERE id IN (SELECT id FROM random_products);

-- Asignar 10 productos aleatorios a "En oferta"
-- Prioriza productos que tengan sale_price definido
WITH random_products AS (
  SELECT id
  FROM public.products
  WHERE (carousel_state IS NULL OR carousel_state = '')
    AND sale_price IS NOT NULL
  ORDER BY RANDOM()
  LIMIT 10
)
UPDATE public.products
SET carousel_state = 'En oferta'
WHERE id IN (SELECT id FROM random_products);

-- Si no hay suficientes productos con sale_price, asignar productos restantes
WITH remaining_products AS (
  SELECT id
  FROM public.products
  WHERE (carousel_state IS NULL OR carousel_state = '')
  ORDER BY RANDOM()
  LIMIT (10 - (SELECT COUNT(*) FROM public.products WHERE carousel_state = 'En oferta'))
)
UPDATE public.products
SET carousel_state = 'En oferta'
WHERE id IN (SELECT id FROM remaining_products)
  AND (SELECT COUNT(*) FROM public.products WHERE carousel_state = 'En oferta') < 10;

-- Asignar 10 productos aleatorios a "Más vendidos"
WITH random_products AS (
  SELECT id
  FROM public.products
  WHERE carousel_state IS NULL OR carousel_state = ''
  ORDER BY RANDOM()
  LIMIT 10
)
UPDATE public.products
SET carousel_state = 'Más vendidos'
WHERE id IN (SELECT id FROM random_products);

-- ============================================
-- PASO 4: Verificar resultados
-- ============================================

-- Resumen por estado
SELECT
  carousel_state,
  COUNT(*) as cantidad_productos
FROM public.products
WHERE carousel_state IS NOT NULL AND carousel_state != ''
GROUP BY carousel_state
ORDER BY carousel_state;

-- Detalle de productos asignados
SELECT
  p.id,
  p.name,
  p.carousel_state,
  p.price,
  p.sale_price,
  CASE
    WHEN p.sale_price IS NOT NULL THEN ROUND(((p.price - p.sale_price) / p.price * 100)::numeric, 0) || '%'
    ELSE 'Sin descuento'
  END as porcentaje_descuento
FROM public.products p
WHERE p.carousel_state IN ('Destacados', 'Vuelta en stock', 'En oferta', 'Más vendidos')
ORDER BY p.carousel_state, p.name;

-- Total de productos con estados asignados
SELECT COUNT(*) as total_productos_con_estado
FROM public.products
WHERE carousel_state IS NOT NULL AND carousel_state != '';
