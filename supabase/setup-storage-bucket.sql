-- ============================================
-- Script para configurar Supabase Storage
-- para imágenes de productos
-- ============================================

-- NOTA IMPORTANTE:
-- Este script configura las políticas de seguridad (RLS)
-- El bucket debe ser creado primero desde la interfaz de Supabase

-- ============================================
-- PASO 1: Políticas para el bucket product-images
-- ============================================

-- Política 1: Permitir lectura pública de imágenes
-- Esto permite que cualquier usuario vea las imágenes de productos
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política 2: Permitir subida de imágenes (INSERT)
-- Permite que usuarios autenticados o anónimos suban imágenes
CREATE POLICY "Allow image uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Política 3: Permitir actualización de imágenes (UPDATE)
-- Permite que usuarios autenticados actualicen imágenes
CREATE POLICY "Allow image updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Política 4: Permitir eliminación de imágenes (DELETE)
-- Permite que usuarios autenticados eliminen imágenes
CREATE POLICY "Allow image deletion"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- ============================================
-- Verificación
-- ============================================

-- Verificar que las políticas se crearon correctamente
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
