import { supabase } from '@/lib/supabase';
import { Order, SupabaseOrder, OrderStatus } from '@/types';

// Convert Supabase order to internal Order format
export function supabaseToOrder(supabaseOrder: SupabaseOrder, orderStatuses: OrderStatus[]): Order {
  // Find the status name from status_id
  const status = orderStatuses.find((s) => s.id === supabaseOrder.status_id);

  return {
    id: supabaseOrder.id,
    order_number: supabaseOrder.order_number,
    customer_name: supabaseOrder.customer_name,
    customer_phone: supabaseOrder.customer_phone,
    customer_email: supabaseOrder.customer_email,
    customer_address: supabaseOrder.customer_address,
    items: supabaseOrder.items,
    subtotal: Number(supabaseOrder.subtotal) || 0,
    discount: Number(supabaseOrder.discount) || 0,
    product_discounts: Number(supabaseOrder.product_discounts) || 0,
    total: Number(supabaseOrder.total) || 0,
    status: status?.name || 'Pendiente',
    status_id: supabaseOrder.status_id,
    notes: supabaseOrder.notes,
    payment_method: supabaseOrder.payment_method,
    createdAt: new Date(supabaseOrder.created_at),
    updatedAt: new Date(supabaseOrder.updated_at),
  };
}

// Convert internal Order to Supabase format
export function orderToSupabase(order: Partial<Order>): Partial<SupabaseOrder> {
  const supabaseOrder: Partial<SupabaseOrder> = {};

  if (order.order_number) supabaseOrder.order_number = order.order_number;
  if (order.customer_name) supabaseOrder.customer_name = order.customer_name;
  if (order.customer_phone) supabaseOrder.customer_phone = order.customer_phone;
  if (order.customer_email !== undefined) supabaseOrder.customer_email = order.customer_email;
  if (order.customer_address !== undefined) supabaseOrder.customer_address = order.customer_address;
  if (order.items) supabaseOrder.items = order.items;
  if (order.subtotal !== undefined) supabaseOrder.subtotal = order.subtotal;
  if (order.discount !== undefined) supabaseOrder.discount = order.discount;
  if (order.product_discounts !== undefined) supabaseOrder.product_discounts = order.product_discounts;
  if (order.total !== undefined) supabaseOrder.total = order.total;
  if (order.status_id) supabaseOrder.status_id = order.status_id;
  if (order.notes !== undefined) supabaseOrder.notes = order.notes;
  if (order.payment_method !== undefined) supabaseOrder.payment_method = order.payment_method;

  return supabaseOrder;
}

// Fetch all orders from Supabase
export async function getOrders(orderStatuses: OrderStatus[]): Promise<Order[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data.map((order) => supabaseToOrder(order as SupabaseOrder, orderStatuses));
}

// Fetch a single order by ID
export async function getOrderById(id: string, orderStatuses: OrderStatus[]): Promise<Order> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }

  return supabaseToOrder(data as SupabaseOrder, orderStatuses);
}

// Update an order's status
export async function updateOrderStatus(orderId: string, statusId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status_id: statusId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Update an order
export async function updateOrder(order: Order, orderStatuses: OrderStatus[]): Promise<Order> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const supabaseOrder = orderToSupabase(order);
  supabaseOrder.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .update(supabaseOrder)
    .eq('id', order.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }

  return supabaseToOrder(data as SupabaseOrder, orderStatuses);
}

// Create a new order
export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, orderStatuses: OrderStatus[]): Promise<Order> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const supabaseOrder = orderToSupabase(order as Order);
  supabaseOrder.created_at = new Date().toISOString();
  supabaseOrder.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .insert([supabaseOrder])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return supabaseToOrder(data as SupabaseOrder, orderStatuses);
}
