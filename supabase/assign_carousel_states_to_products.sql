-- Script para asignar estados de carrusel a 40 productos aleatorios
-- 10 productos para cada estado: Destacados, Vuelta en stock, En oferta, Más vendidos

-- ============================================
-- PASO 1: Verificar estados disponibles
-- ============================================
-- Ejecuta esto primero para ver los estados que tienes
SELECT id, name, type FROM public.product_carousel_states ORDER BY name;

-- ============================================
-- PASO 2: Limpiar estados anteriores (opcional)
-- ============================================
-- Descomentar si quieres limpiar todos los carousel_state antes de asignar
-- UPDATE public.products SET carousel_state = NULL;

-- ============================================
-- PASO 3: Asignar estados a productos aleatorios
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
-- Ver cuántos productos tienen cada estado
SELECT
  carousel_state,
  COUNT(*) as cantidad_productos
FROM public.products
WHERE carousel_state IS NOT NULL AND carousel_state != ''
GROUP BY carousel_state
ORDER BY carousel_state;

-- Ver los productos asignados con sus estados
SELECT
  id,
  name,
  carousel_state,
  price,
  sale_price
FROM public.products
WHERE carousel_state IN ('Destacados', 'Vuelta en stock', 'En oferta', 'Más vendidos')
ORDER BY carousel_state, name;
