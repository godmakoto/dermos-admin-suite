import { supabase } from '@/lib/supabase';
import { SupabaseProduct, SupabaseProductWithImages, Product } from '@/types';

/**
 * Extract storage path from a Supabase Storage URL.
 * Returns null for external URLs (e.g. Firebase).
 */
function extractStoragePath(imageUrl: string): string | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  if (!supabaseUrl || !imageUrl.includes(supabaseUrl.replace('https://', ''))) {
    return null;
  }
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1];
  } catch {
    return null;
  }
}

/**
 * Sync product_images rows for a given product (delete + insert).
 */
async function syncProductImages(productId: string, images: string[]): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    console.error('Error deleting product images:', deleteError);
    throw new Error(`Failed to sync product images: ${deleteError.message}`);
  }

  if (images.length > 0) {
    const rows = images.map((url, index) => ({
      product_id: productId,
      image_url: url,
      storage_path: extractStoragePath(url),
      position: index,
    }));

    const { error: insertError } = await supabase
      .from('product_images')
      .insert(rows);

    if (insertError) {
      console.error('Error inserting product images:', insertError);
      throw new Error(`Failed to sync product images: ${insertError.message}`);
    }
  }
}

/**
 * Convert a Supabase product (with joined images) to the internal Product format
 */
export function supabaseToProduct(row: SupabaseProductWithImages): Product {
  const images = (row.product_images || [])
    .sort((a, b) => a.position - b.position)
    .map((img) => img.image_url);

  return {
    id: row.id,
    name: row.title || '',
    price: row.regular_price ?? 0,
    salePrice: row.offer_price ?? undefined,
    categories: row.categories || [],
    subcategories: row.subcategories || [],
    brand: row.brand || '',
    label: row.label || '',
    carouselState: row.carousel_state || '',
    shortDescription: row.short_description || '',
    longDescription: row.long_description || '',
    usage: row.usage_instructions || '',
    ingredients: row.ingredients || '',
    images,
    trackStock: row.track_stock ?? false,
    stock: row.stock ?? 0,
    status: 'Activo',
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(row.created_at),
  };
}

/**
 * Convert internal Product format to Supabase product.
 */
export function productToSupabase(product: Partial<Product>): Partial<SupabaseProduct> {
  return {
    product_id: product.id || crypto.randomUUID(),
    title: product.name || null,
    offer_price: product.salePrice ?? null,
    regular_price: product.price ?? null,
    long_description: product.longDescription || null,
    short_description: product.shortDescription || null,
    usage_instructions: product.usage || null,
    ingredients: product.ingredients || null,
    brand: product.brand || null,
    label: product.label || null,
    carousel_state: product.carouselState || null,
    categories: product.categories || [],
    subcategories: product.subcategories || [],
    track_stock: product.trackStock ?? false,
    stock: product.stock ?? 0,
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
    .select('*, product_images(*)')
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
    .select('*, product_images(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
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

  const images = product.images || [];
  if (images.length > 0) {
    await syncProductImages(data.id, images);
  }

  const created = await getProductById(data.id);
  if (!created) throw new Error('Failed to fetch created product');
  return created;
}

/**
 * Update an existing product in Supabase
 */
export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const supabaseProduct = productToSupabase(product);

  const { error } = await supabase
    .from('products')
    .update(supabaseProduct)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }

  const images = product.images || [];
  await syncProductImages(id, images);

  const updated = await getProductById(id);
  if (!updated) throw new Error('Failed to fetch updated product');
  return updated;
}

/**
 * Delete a product from Supabase
 */
export async function deleteProduct(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  // Fetch images before delete for storage cleanup
  const { data: images } = await supabase
    .from('product_images')
    .select('image_url, storage_path')
    .eq('product_id', id);

  // Delete product (CASCADE removes product_images rows)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  // Best-effort storage cleanup (only for Supabase Storage files)
  if (images && images.length > 0) {
    try {
      const filePaths = images
        .map((img) => {
          if (img.storage_path) return img.storage_path;
          return extractStoragePath(img.image_url);
        })
        .filter((p): p is string => p !== null);

      if (filePaths.length > 0) {
        await supabase.storage.from('product-images').remove(filePaths);
      }
    } catch (err) {
      console.error('Failed to cleanup storage images:', err);
    }
  }
}
