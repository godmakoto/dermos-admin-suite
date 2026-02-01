-- ============================================
-- Script para asignar estados de carrusel
-- a 40 productos aleatorios
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

-- Asignar 10 productos aleatorios a "De vuelta en stock"
WITH random_products AS (
  SELECT id
  FROM public.products
  WHERE carousel_state IS NULL OR carousel_state = ''
  ORDER BY RANDOM()
  LIMIT 10
)
UPDATE public.products
SET carousel_state = 'De vuelta en stock'
WHERE id IN (SELECT id FROM random_products);

-- Asignar 10 productos aleatorios a "Ofertas"
WITH random_products AS (
  SELECT id
  FROM public.products
  WHERE carousel_state IS NULL OR carousel_state = ''
  ORDER BY RANDOM()
  LIMIT 10
)
UPDATE public.products
SET carousel_state = 'Ofertas'
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

-- Ver cuántos productos se asignaron a cada estado
SELECT
  carousel_state,
  COUNT(*) as cantidad
FROM public.products
WHERE carousel_state IN ('Destacados', 'De vuelta en stock', 'Ofertas', 'Más vendidos')
GROUP BY carousel_state
ORDER BY carousel_state;
