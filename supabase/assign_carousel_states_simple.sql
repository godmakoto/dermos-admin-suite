-- ============================================
-- Script SIMPLE para asignar estados de carrusel
-- a 40 productos aleatorios (sin dependencias)
-- ============================================

-- PASO 1: Verificar estados disponibles
-- ============================================
SELECT id, name, type FROM public.product_carousel_states ORDER BY name;

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
WITH random_products AS (
  SELECT id
  FROM public.products
  WHERE carousel_state IS NULL OR carousel_state = ''
  ORDER BY RANDOM()
  LIMIT 10
)
UPDATE public.products
SET carousel_state = 'En oferta'
WHERE id IN (SELECT id FROM random_products);

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
  p.price
FROM public.products p
WHERE p.carousel_state IN ('Destacados', 'Vuelta en stock', 'En oferta', 'Más vendidos')
ORDER BY p.carousel_state, p.name
LIMIT 50;

-- Total de productos con estados asignados
SELECT COUNT(*) as total_productos_con_estado
FROM public.products
WHERE carousel_state IS NOT NULL AND carousel_state != '';
