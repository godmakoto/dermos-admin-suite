# 🔍 Problema: Cambios del Admin Panel no aparecen en Web Cliente

## 📋 Diagnóstico

Has reportado que los cambios realizados en el panel de administración (dermos-admin-suite) no se reflejan en la web del cliente (evelyn-cosmetics). Esto indica que **ambos proyectos NO están conectados a la misma base de datos Supabase**.

## 🔎 Pasos para Verificar el Problema

### 1. Verificar que los cambios están en Supabase

Ejecuta el script `verify_supabase_sync.sql` en el SQL Editor de Supabase:

```sql
-- Verifica productos con categoría "Labios"
SELECT id, title, categories, updated_at
FROM public.products
WHERE categories::text LIKE '%Labios%';
```

**Si ves los productos**: ✅ Los cambios SÍ están guardados en Supabase
**Si NO ves productos**: ❌ El admin panel no está guardando en Supabase

### 2. Verificar configuración del proyecto cliente

El proyecto cliente (evelyn-cosmetics) debe tener las **MISMAS credenciales de Supabase** que el admin panel.

**En el proyecto admin (`dermos-admin-suite`)**, las variables están en `.env`:
```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

**En el proyecto cliente (`evelyn-cosmetics`)**, debe tener:
```env
# Para Vite (si usa Vite)
VITE_SUPABASE_URL=LA-MISMA-URL-DEL-ADMIN
VITE_SUPABASE_ANON_KEY=LA-MISMA-KEY-DEL-ADMIN

# Para Next.js (si usa Next.js)
NEXT_PUBLIC_SUPABASE_URL=LA-MISMA-URL-DEL-ADMIN
NEXT_PUBLIC_SUPABASE_ANON_KEY=LA-MISMA-KEY-DEL-ADMIN
```

## ⚠️ Problemas Comunes

### Problema 1: Cliente usa datos mock en lugar de Supabase

**Síntoma**: El cliente muestra productos, pero son datos de prueba que nunca cambian.

**Solución**:
- Verificar que el cliente tenga el archivo `.env` con las credenciales correctas
- Verificar que el código del cliente esté usando `supabase.from('products')` y no datos mock

### Problema 2: Diferentes instancias de Supabase

**Síntoma**: Ambos proyectos están conectados a Supabase, pero a proyectos diferentes.

**Solución**:
- Copiar exactamente las mismas credenciales del admin al cliente
- Las credenciales se encuentran en: https://app.supabase.com/project/TU-PROYECTO/settings/api

### Problema 3: Variables de entorno no cargadas

**Síntoma**: El archivo `.env` existe pero el cliente no lee las variables.

**Solución**:
```bash
# En el proyecto cliente, reiniciar el servidor de desarrollo
npm run dev
# o
yarn dev
```

### Problema 4: Cache del navegador

**Síntoma**: Los cambios están en Supabase pero el navegador muestra datos viejos.

**Solución**:
- Hacer hard refresh: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
- Limpiar cache del navegador
- Abrir en ventana de incógnito

## ✅ Solución Paso a Paso

### Paso 1: Obtener credenciales de Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a Settings > API
4. Copia:
   - **Project URL** (ej: `https://xxx.supabase.co`)
   - **anon/public key** (ej: `eyJhbGc...`)

### Paso 2: Configurar el proyecto cliente

1. Localiza el proyecto cliente (evelyn-cosmetics)
2. Crea o edita el archivo `.env` en la raíz del proyecto
3. Agrega las credenciales:

```env
# Si el cliente usa Vite
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Si el cliente usa Next.js
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 3: Verificar el código del cliente

Busca en el código del cliente cómo carga los productos. Debe usar Supabase:

```typescript
// ✅ CORRECTO - Carga desde Supabase
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('categories', 'Labios');

// ❌ INCORRECTO - Usa datos mock
const products = mockProducts.filter(p => p.categories.includes('Labios'));
```

### Paso 4: Reiniciar ambos proyectos

```bash
# En el proyecto cliente
# 1. Detener el servidor (Ctrl + C)
# 2. Reiniciar
npm run dev
```

### Paso 5: Verificar en Vercel (si está desplegado)

Si el cliente está desplegado en Vercel:

1. Ve a https://vercel.com
2. Selecciona el proyecto cliente
3. Ve a Settings > Environment Variables
4. Agrega las mismas variables:
   - `VITE_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Redeploy el proyecto

## 🔧 Script de Diagnóstico

Ejecuta este script en el SQL Editor de Supabase para ver el estado actual:

```sql
-- Ver todos los productos con categorías
SELECT
  title,
  categories,
  subcategories,
  updated_at
FROM public.products
WHERE categories != '[]'::jsonb
ORDER BY updated_at DESC
LIMIT 20;
```

## 📞 Siguiente Paso

**Responde estas preguntas para diagnosticar mejor:**

1. ¿El proyecto cliente (evelyn-cosmetics) tiene un archivo `.env`?
2. ¿Qué framework usa el cliente? (Vite, Next.js, otro)
3. ¿El cliente está desplegado en Vercel o solo en local?
4. ¿Ejecutaste el script `verify_supabase_sync.sql`? ¿Qué resultado obtuviste?

Con esta información puedo ayudarte a configurar correctamente la sincronización.

## 📁 Archivos Relacionados

- **Script de verificación**: `verify_supabase_sync.sql`
- **Configuración Supabase**: `src/lib/supabase.ts`
- **Servicio de productos**: `src/services/productService.ts`
- **Tipos**: `src/types/index.ts`
