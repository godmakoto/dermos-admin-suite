import { supabase } from '@/lib/supabase';
import { Brand, Label, ProductCarouselState, OrderStatus } from '@/types';

/**
 * BRANDS
 */

export async function getBrands(): Promise<Brand[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
    throw new Error(`Failed to fetch brands: ${error.message}`);
  }

  return (data || []).map(brand => ({
    id: brand.id,
    name: brand.name,
  }));
}

export async function createBrand(name: string): Promise<Brand> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('brands')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating brand:', error);
    throw new Error(`Failed to create brand: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
  };
}

export async function deleteBrand(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting brand:', error);
    throw new Error(`Failed to delete brand: ${error.message}`);
  }
}

/**
 * LABELS (Propiedades)
 */

export async function getLabels(): Promise<Label[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching labels:', error);
    throw new Error(`Failed to fetch labels: ${error.message}`);
  }

  return (data || []).map(label => ({
    id: label.id,
    name: label.name,
    color: label.color,
  }));
}

export async function createLabel(name: string, color: string): Promise<Label> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('labels')
    .insert([{ name, color }])
    .select()
    .single();

  if (error) {
    console.error('Error creating label:', error);
    throw new Error(`Failed to create label: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
  };
}

export async function deleteLabel(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('labels')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting label:', error);
    throw new Error(`Failed to delete label: ${error.message}`);
  }
}

/**
 * PRODUCT CAROUSEL STATES
 */

export async function getProductCarouselStates(): Promise<ProductCarouselState[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('product_carousel_states')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching carousel states:', error);
    throw new Error(`Failed to fetch carousel states: ${error.message}`);
  }

  return (data || []).map(state => ({
    id: state.id,
    name: state.name,
    type: state.type as 'carousel' | 'banner',
    color: state.color,
  }));
}

export async function createProductCarouselState(
  name: string,
  type: 'carousel' | 'banner',
  color: string
): Promise<ProductCarouselState> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('product_carousel_states')
    .insert([{ name, type, color }])
    .select()
    .single();

  if (error) {
    console.error('Error creating carousel state:', error);
    throw new Error(`Failed to create carousel state: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type as 'carousel' | 'banner',
    color: data.color,
  };
}

export async function deleteProductCarouselState(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('product_carousel_states')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting carousel state:', error);
    throw new Error(`Failed to delete carousel state: ${error.message}`);
  }
}

/**
 * ORDER STATUSES
 */

export async function getOrderStatuses(): Promise<OrderStatus[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('order_statuses')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching order statuses:', error);
    throw new Error(`Failed to fetch order statuses: ${error.message}`);
  }

  return (data || []).map(status => ({
    id: status.id,
    name: status.name,
    color: status.color,
  }));
}

export async function createOrderStatus(name: string, color: string): Promise<OrderStatus> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('order_statuses')
    .insert([{ name, color }])
    .select()
    .single();

  if (error) {
    console.error('Error creating order status:', error);
    throw new Error(`Failed to create order status: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
  };
}

export async function deleteOrderStatus(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('order_statuses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order status:', error);
    throw new Error(`Failed to delete order status: ${error.message}`);
  }
}
