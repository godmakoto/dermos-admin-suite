# Prompt para actualizar evelyn-cosmetics-header - Formato de Order Number

Necesito cambiar el formato de generación de `order_number` en el cliente web para usar un formato secuencial simple.

## Nuevo Formato

Cambiar de:
- `ORD-20260113-012251521` (timestamp)

A:
- `ORD-1000`, `ORD-1001`, `ORD-1002`, etc. (secuencial)

## Cambio Necesario

Encuentra el código donde se genera el `order_number` para nuevos pedidos (probablemente en el checkout o donde se crea el pedido).

**ANTES (timestamp):**
```typescript
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
const orderNumber = `ORD-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
```

**DESPUÉS (secuencial):**
```typescript
// Primero, obtener todos los pedidos existentes de Supabase
const { data: existingOrders } = await supabase
  .from('orders')
  .select('order_number')
  .order('created_at', { ascending: false });

// Encontrar el número más alto y sumarle 1
let nextOrderNumber = 1000;
if (existingOrders && existingOrders.length > 0) {
  const orderNumbers = existingOrders
    .map(o => {
      const match = o.order_number.match(/ORD-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(n => n > 0);

  if (orderNumbers.length > 0) {
    nextOrderNumber = Math.max(...orderNumbers) + 1;
  }
}

const orderNumber = `ORD-${nextOrderNumber}`;
```

## Importante

- El admin panel ya está actualizado con este formato
- Los pedidos existentes serán eliminados (ejecutar `supabase/reset_orders.sql`)
- Empezaremos desde ORD-1000
- Cada nuevo pedido incrementa en 1: ORD-1000, ORD-1001, ORD-1002, etc.

Por favor, encuentra y actualiza el código de generación de order_number en el cliente web.
