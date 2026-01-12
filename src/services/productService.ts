import { supabase } from '@/lib/supabase';
import { SupabaseProduct, Product } from '@/types';

/**
 * Convert a Supabase product to the internal Product format
 */
export function supabaseToProduct(supabaseProduct: SupabaseProduct): Product {
  const images = [
    supabaseProduct.image_1,
    supabaseProduct.image_2,
    supabaseProduct.image_3,
    supabaseProduct.image_4,
    supabaseProduct.image_5,
    supabaseProduct.image_6,
    supabaseProduct.image_7,
  ].filter((img): img is string => img !== null && img !== '');

  return {
    id: supabaseProduct.id,
    name: supabaseProduct.title || '',
    price: supabaseProduct.regular_price || 0,
    salePrice: supabaseProduct.offer_price || undefined,
    categories: supabaseProduct.categories || [],
    subcategories: supabaseProduct.subcategories || [],
    brand: supabaseProduct.brand || '',
    label: supabaseProduct.label || '',
    carouselState: supabaseProduct.carousel_state || '',
    shortDescription: supabaseProduct.short_description || '',
    longDescription: supabaseProduct.long_description || '',
    usage: supabaseProduct.usage_instructions || '',
    ingredients: supabaseProduct.ingredients || '',
    images,
    trackStock: supabaseProduct.track_stock || false,
    stock: supabaseProduct.stock || 0,
    status: 'Activo', // Default status, managed at app level only
    createdAt: new Date(supabaseProduct.created_at),
    updatedAt: supabaseProduct.updated_at ? new Date(supabaseProduct.updated_at) : new Date(supabaseProduct.created_at),
  };
}

/**
 * Convert internal Product format to Supabase product
 */
export function productToSupabase(product: Partial<Product>): Partial<SupabaseProduct> {
  const images = product.images || [];
  return {
    product_id: product.id || crypto.randomUUID(),
    title: product.name || null,
    offer_price: product.salePrice || null,
    regular_price: product.price || null,
    long_description: product.longDescription || null,
    short_description: product.shortDescription || null,
    usage_instructions: product.usage || null,
    ingredients: product.ingredients || null,
    image_1: images[0] || null,
    image_2: images[1] || null,
    image_3: images[2] || null,
    image_4: images[3] || null,
    image_5: images[4] || null,
    image_6: images[5] || null,
    image_7: images[6] || null,
    brand: product.brand || null,
    label: product.label || null,
    carousel_state: product.carouselState || null,
    categories: product.categories || [],
    subcategories: product.subcategories || [],
    track_stock: product.trackStock || false,
    stock: product.stock || 0,
  };
}

/**
 * Get all products from Supabase
 */
export async function getProducts(): Promise<Product[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data || []).map(supabaseToProduct);
}

/**
 * Get a single product by ID from Supabase
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching product:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data ? supabaseToProduct(data) : null;
}

/**
 * Create a new product in Supabase
 */
export async function createProduct(product: Partial<Product>): Promise<Product> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const supabaseProduct = productToSupabase(product);

  const { data, error } = await supabase
    .from('products')
    .insert([supabaseProduct])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return supabaseToProduct(data);
}

/**
 * Update an existing product in Supabase
 */
export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const supabaseProduct = productToSupabase(product);

  const { data, error } = await supabase
    .from('products')
    .update(supabaseProduct)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return supabaseToProduct(data);
}

/**
 * Delete a product from Supabase
 */
export async function deleteProduct(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}
