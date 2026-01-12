# Prompt para Claude Code - Repositorio Cliente

Copia y pega este prompt completo en la sesión de Claude Code que tiene abierto el repositorio `evelyn-cosmetics-header`:

---

Necesito sincronizar este proyecto cliente con el panel de administración. El problema es que el admin panel guarda productos con `categories` (array JSONB) pero este cliente lee `category` (string singular), por eso los cambios del admin no aparecen aquí.

## 🎯 Objetivo

Actualizar el proyecto para que use `categories` y `subcategories` como arrays en lugar de strings singulares, para que se sincronice con el admin panel.

## 📋 Tareas a Realizar

### PASO 1: Ejecutar Migración SQL en Supabase

Primero, ejecuta esta migración en Supabase SQL Editor:

```sql
-- Migration: Convert singular category/subcategory to plural arrays
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS categories jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS subcategories jsonb DEFAULT '[]'::jsonb;

-- Migrate existing data from singular to plural arrays
UPDATE public.products
SET categories =
  CASE
    WHEN category IS NOT NULL AND category != ''
    THEN jsonb_build_array(category)
    ELSE '[]'::jsonb
  END
WHERE categories = '[]'::jsonb;

UPDATE public.products
SET subcategories =
  CASE
    WHEN subcategory IS NOT NULL AND subcategory != ''
    THEN jsonb_build_array(subcategory)
    ELSE '[]'::jsonb
  END
WHERE subcategories = '[]'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_categories ON public.products USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_products_subcategories ON public.products USING GIN (subcategories);
```

Verifica que funcionó con:

```sql
SELECT id, title, category, categories, subcategory, subcategories
FROM public.products
LIMIT 10;
```

### PASO 2: Actualizar Tipos TypeScript

En el archivo `src/integrations/supabase/types.ts`, busca la interfaz `Product` y agrega estos campos:

```typescript
export type Product = {
  // ... campos existentes ...
  category: string | null          // Mantener por compatibilidad
  subcategory: string | null       // Mantener por compatibilidad
  categories: string[]             // ✅ AGREGAR ESTE
  subcategories: string[]          // ✅ AGREGAR ESTE
  // ... resto de campos ...
}
```

### PASO 3: Actualizar Filtrado en ProductGrid

En el archivo `src/components/shop/ProductGrid.tsx`, encuentra donde se filtran los productos por categoría y subcategoría.

**BUSCA ESTO:**
```typescript
if (categoryFilter) {
  filtered = filtered.filter(
    (product) => product.category === categoryFilter
  );
}

if (subcategoryFilter) {
  filtered = filtered.filter(
    (product) => product.subcategory === subcategoryFilter
  );
}
```

**REEMPLÁZALO CON:**
```typescript
if (categoryFilter) {
  filtered = filtered.filter(
    (product) =>
      product.categories &&
      Array.isArray(product.categories) &&
      product.categories.includes(categoryFilter)
  );
}

if (subcategoryFilter) {
  filtered = filtered.filter(
    (product) =>
      product.subcategories &&
      Array.isArray(product.subcategories) &&
      product.subcategories.includes(subcategoryFilter)
  );
}
```

### PASO 4: Actualizar Búsqueda de Texto

En el mismo archivo `src/components/shop/ProductGrid.tsx`, si hay una búsqueda que incluye categorías:

**BUSCA ALGO COMO:**
```typescript
const matchesSearch =
  product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
```

**REEMPLÁZALO CON:**
```typescript
const matchesSearch =
  product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (product.categories && product.categories.some(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  )) ||
  (product.subcategories && product.subcategories.some(sub =>
    sub.toLowerCase().includes(searchQuery.toLowerCase())
  ));
```

### PASO 5: (Opcional) Mejorar React Query Cache

En el archivo `src/App.tsx`, mejora la configuración del QueryClient:

**BUSCA:**
```typescript
const queryClient = new QueryClient();
```

**REEMPLÁZALO CON:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,              // 1 minuto
      cacheTime: 1000 * 60 * 5,          // 5 minutos
      refetchOnWindowFocus: true,        // Refetch al volver a la ventana
      refetchOnReconnect: true,          // Refetch al reconectar
    },
  },
});
```

### PASO 6: Crear PR

Después de hacer todos los cambios:
1. Crea un commit con mensaje descriptivo
2. Push a una nueva rama (ej: `feat/sync-categories-with-admin`)
3. Crea un Pull Request con título: "Sync product categories schema with admin panel"

## 🧪 Verificación

Después de hacer los cambios y hacer merge del PR:

1. Haz redeploy en Vercel
2. Espera 2-3 minutos
3. Abre el sitio en ventana de incógnito
4. Ve a `/tienda` y filtra por "Labios"
5. Deberías ver los productos que configuraste con esa categoría en el admin panel

## 📝 Resumen de Archivos a Modificar

- `src/integrations/supabase/types.ts` - Agregar campos `categories` y `subcategories`
- `src/components/shop/ProductGrid.tsx` - Actualizar filtros y búsqueda para usar arrays
- `src/App.tsx` - (Opcional) Mejorar cache de React Query

## ❓ Notas Importantes

- Los campos `category` y `subcategory` singulares se mantienen por compatibilidad
- Los arrays `categories` y `subcategories` son los que el admin panel usa
- Después de verificar que funciona, puedes eliminar los campos singulares si quieres

¿Puedes hacer estos cambios y crear un PR?
