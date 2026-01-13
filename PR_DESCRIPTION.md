# Pull Request: Configure Orders section to work with Supabase database

## Summary

This PR configures the Orders section in the admin panel to work correctly with the Supabase orders table. It includes major improvements to discount handling, order number formatting, and data loading.

## Changes Made

### 1. **Connect Orders to Supabase** (c5a0c4f)
- Updated Order and OrderItem interfaces to match Supabase schema
- Created orderService.ts with full CRUD operations
- Updated AppContext to load orders from Supabase
- Modified Orders page to use order_number instead of generic id
- Rewrote OrderModal to work with new schema

### 2. **Fix Discount Handling** (e9274ab, ad4c60f, 5e8a4cf)
- Identified issue: discount field was being used for both automatic product discounts and manual additional discounts
- **Solution**: Added separate `product_discounts` column to orders table
- Created migration: `add_product_discounts_column.sql`
- Updated TypeScript types to include product_discounts field
- Updated orderService and OrderModal to calculate and save both discount types separately
- Now discount structure is clear:
  - `discount`: Manual additional discount (what admin enters)
  - `product_discounts`: Automatic discounts from products with sale prices

### 3. **Remove Mock Orders** (3cef056, 8be63d2)
- Removed initialization with mockOrders data
- Orders now load only from Supabase database
- No more fallback to fake orders when database fails
- Added SQL script to verify orders column usage

### 4. **Change Order Number Format** (8ed11ce, b6ed4ba)
- Changed from timestamp format: `ORD-20260113-012251521`
- To sequential format: `ORD-1000`, `ORD-1001`, `ORD-1002`, etc.
- Easier to read, communicate, and remember
- Auto-increments based on highest existing order number
- Added SQL script to reset orders and start fresh
- Created prompt for web client to implement same format

## Files Modified

### Core Files
- src/types/index.ts: Updated Order, OrderItem, SupabaseOrder interfaces
- src/services/orderService.ts: Created new service with CRUD operations
- src/contexts/AppContext.tsx: Updated order loading from Supabase
- src/pages/Orders.tsx: Updated to use order_number, async status changes
- src/components/orders/OrderModal.tsx: Complete rewrite for new schema

### SQL Scripts & Documentation
- supabase/migrations/add_product_discounts_column.sql: New migration for discount separation
- supabase/check_discounts_structure.sql: Verify discount structure in orders
- supabase/check_orders_columns.sql: Check which columns are being used
- supabase/reset_orders.sql: Reset all orders to start with new format
- supabase/prompt_for_web_client_order_number.md: Guide for updating web client

## Database Schema Changes

New column added to orders table:
- product_discounts (numeric, default 0): Stores automatic discounts from sale prices

## Breaking Changes

⚠️ **Important**: The web client (evelyn-cosmetics-header) needs to be updated to:
1. Save automatic discounts to product_discounts instead of discount
2. Use the new sequential order number format (ORD-1000, ORD-1001, etc.)

## Testing

- ✅ Admin panel creates orders with new format
- ✅ Discount separation works correctly
- ✅ Orders load only from Supabase
- ✅ Order number auto-increments properly

## Next Steps

1. Execute supabase/migrations/add_product_discounts_column.sql in Supabase
2. Execute supabase/reset_orders.sql to clean existing orders (optional)
3. Update evelyn-cosmetics-header to use new discount structure and order format
