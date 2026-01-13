-- ⚠️ CUIDADO: Este script eliminará TODOS los pedidos existentes
-- Solo ejecutar si estás seguro de querer borrar todos los datos

-- Eliminar todos los pedidos
DELETE FROM public.orders;

-- Verificar que se eliminaron
SELECT COUNT(*) as pedidos_restantes FROM public.orders;

-- Opcional: Si quieres resetear el autoincremento del ID (si existe)
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
