# 🔧 Cambios de Código para el Cliente Web

Este documento contiene todos los cambios necesarios en el proyecto `evelyn-cosmetics-header` para sincronizar con el panel de administración.

---

## 📋 Resumen del Problema

**Admin Panel usa:**
- `categories: string[]` (array JSONB)
- `subcategories: string[]` (array JSONB)

**Cliente Web usa:**
- `category: string | null` (string simple)
- `subcategory: string | null` (string simple)

**Resultado:** Los cambios del admin no aparecen en el cliente porque usan campos diferentes.

---

## ✅ Pasos para Actualizar el Cliente

### 1️⃣ Ejecutar Migración en Supabase

Ejecuta el archivo `migrate_category_to_categories_array.sql` en el SQL Editor de Supabase:

```sql
-- Esto agregará las columnas categories y subcategories
-- Y migrará los datos existentes de category -> categories
```

**IMPORTANTE:** Después de ejecutar, verifica que funcionó con:

```sql
SELECT
  id,
  title,
  category as old_category,
  categories as new_categories,
  subcategory as old_subcategory,
  subcategories as new_subcategories
FROM public.products
LIMIT 10;
```

---

### 2️⃣ Actualizar Tipos TypeScript

**Archivo:** `src/integrations/supabase/types.ts`

#### ANTES:
```typescript
export type Product = {
  id: string
  product_id: string
  title: string
  brand: string | null
  category: string | null          // ❌ SINGULAR
  subcategory: string | null       // ❌ SINGULAR
  // ... otros campos
}
```

#### DESPUÉS:
```typescript
export type Product = {
  id: string
  product_id: string
  title: string
  brand: string | null
  category: string | null          // Mantener por compatibilidad temporal
  subcategory: string | null       // Mantener por compatibilidad temporal
  categories: string[]             // ✅ NUEVO - PLURAL ARRAY
  subcategories: string[]          // ✅ NUEVO - PLURAL ARRAY
  // ... otros campos
}
```

---

### 3️⃣ Actualizar Filtrado en ProductGrid

**Archivo:** `src/components/shop/ProductGrid.tsx`

Busca la sección donde se filtran productos por categoría y subcategoría.

#### ANTES:
```typescript
// Filtrar por categoría
if (categoryFilter) {
  filtered = filtered.filter(
    (product) => product.category === categoryFilter  // ❌ Compara string
  );
}

// Filtrar por subcategoría
if (subcategoryFilter) {
  filtered = filtered.filter(
    (product) => product.subcategory === subcategoryFilter  // ❌ Compara string
  );
}
```

#### DESPUÉS:
```typescript
// Filtrar por categoría (ahora busca en el array)
if (categoryFilter) {
  filtered = filtered.filter(
    (product) =>
      product.categories &&
      product.categories.includes(categoryFilter)  // ✅ Busca en array
  );
}

// Filtrar por subcategoría (ahora busca en el array)
if (subcategoryFilter) {
  filtered = filtered.filter(
    (product) =>
      product.subcategories &&
      product.subcategories.includes(subcategoryFilter)  // ✅ Busca en array
  );
}
```

---

### 4️⃣ Actualizar Búsqueda de Texto (si aplica)

**Archivo:** `src/components/shop/ProductGrid.tsx`

Si tienes una búsqueda que incluye categorías:

#### ANTES:
```typescript
const matchesSearch =
  product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||  // ❌
  product.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());  // ❌
```

#### DESPUÉS:
```typescript
const matchesSearch =
  product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.categories?.some(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  ) ||  // ✅ Busca en array
  product.subcategories?.some(sub =>
    sub.toLowerCase().includes(searchQuery.toLowerCase())
  );  // ✅ Busca en array
```

---

### 5️⃣ Actualizar Visualización de Categorías

Si muestras las categorías en algún componente (ej: ProductCard, ProductPage):

#### ANTES:
```typescript
// Mostrar categoría única
<Badge>{product.category}</Badge>
```

#### DESPUÉS:
```typescript
// Mostrar todas las categorías
{product.categories && product.categories.length > 0 && (
  <div className="flex gap-2 flex-wrap">
    {product.categories.map((category, index) => (
      <Badge key={index}>{category}</Badge>
    ))}
  </div>
)}
```

---

### 6️⃣ Actualizar ShopFilters (Dropdown de Categorías)

**Archivo:** `src/components/shop/ShopFilters.tsx`

El filtro de categorías debería seguir funcionando igual, pero asegúrate de que el estado se pase correctamente a ProductGrid.

**NO REQUIERE CAMBIOS** si solo pasas el nombre de la categoría como string al ProductGrid.

---

### 7️⃣ Actualizar Navegación desde CategoriesCarousel

**Archivo:** Cualquier componente que navegue a `/tienda` con filtros

#### ANTES:
```typescript
navigate('/tienda', {
  state: {
    categoryFilter: "Labios",
    subcategoryFilter: null
  }
});
```

#### DESPUÉS:
```typescript
// NO REQUIERE CAMBIOS
// El filtro sigue pasándose como string,
// pero ProductGrid ahora buscará ese string dentro del array
navigate('/tienda', {
  state: {
    categoryFilter: "Labios",
    subcategoryFilter: null
  }
});
```

---

### 8️⃣ (OPCIONAL) Mejorar React Query Cache

**Archivo:** `src/App.tsx`

Para que los cambios aparezcan más rápido:

#### ANTES:
```typescript
const queryClient = new QueryClient();
```

#### DESPUÉS:
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

---

### 9️⃣ (OPCIONAL) Agregar Invalidación de Cache

Si quieres que los cambios del admin aparezcan inmediatamente, puedes agregar un botón de "Refrescar" o invalidar automáticamente:

```typescript
import { useQueryClient } from "@tanstack/react-query";

function RefreshButton() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <Button onClick={handleRefresh}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Refrescar Productos
    </Button>
  );
}
```

---

## 🧪 Pruebas

Después de hacer los cambios:

### Prueba 1: Verificar Datos en Supabase
```sql
SELECT id, title, categories, subcategories
FROM public.products
WHERE categories @> '["Labios"]'::jsonb;
```

### Prueba 2: Verificar en el Cliente
1. Abre el cliente web
2. Ve a `/tienda`
3. Filtra por categoría "Labios"
4. Deberías ver el producto que configuraste

### Prueba 3: Hacer un Cambio en el Admin
1. En el admin panel, edita un producto
2. Agrégale la categoría "Labios"
3. Guarda
4. Ve al cliente y haz hard refresh (`Ctrl + Shift + R`)
5. El producto debe aparecer en "Labios"

---

## 🔄 Rollback (Si algo sale mal)

Si necesitas volver atrás:

```sql
-- Restaurar campos singulares desde los arrays
UPDATE public.products
SET
  category = categories->0,
  subcategory = subcategories->0
WHERE categories != '[]'::jsonb;

-- Eliminar columnas nuevas
ALTER TABLE public.products DROP COLUMN categories;
ALTER TABLE public.products DROP COLUMN subcategories;
```

---

## 📦 Checklist de Implementación

- [ ] Ejecutar migración SQL en Supabase
- [ ] Verificar migración con query de prueba
- [ ] Actualizar tipos TypeScript (`types.ts`)
- [ ] Actualizar filtrado en `ProductGrid.tsx`
- [ ] Actualizar búsqueda de texto (si aplica)
- [ ] Actualizar visualización de categorías (si aplica)
- [ ] Probar filtro "Labios" en el cliente
- [ ] Hacer cambio en admin y verificar en cliente
- [ ] (Opcional) Mejorar React Query cache
- [ ] (Opcional) Eliminar columnas viejas después de confirmar que funciona

---

## 🆘 Si Necesitas Ayuda

Si algo no funciona:

1. Verifica que ejecutaste la migración SQL
2. Verifica que hiciste hard refresh (`Ctrl + Shift + R`)
3. Verifica la consola del navegador por errores TypeScript
4. Verifica que Vercel tenga las variables de entorno correctas
5. Haz un redeploy en Vercel después de los cambios de código

---

## 📝 Notas Adicionales

**Ventajas de usar arrays:**
- ✅ Un producto puede tener múltiples categorías
- ✅ Más flexible para futuros cambios
- ✅ Consistente con el admin panel

**Después de verificar que funciona:**
- Puedes eliminar las columnas `category` y `subcategory` singulares
- Descomenta las líneas en la migración SQL para eliminarlas
