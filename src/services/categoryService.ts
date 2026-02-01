import { supabase } from '@/lib/supabase';
import { Category, Subcategory } from '@/types';

/**
 * Get all categories from Supabase
 */
export async function getCategories(): Promise<Category[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
  }));
}

/**
 * Get all subcategories from Supabase
 */
export async function getSubcategories(): Promise<Subcategory[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching subcategories:', error);
    throw new Error(`Failed to fetch subcategories: ${error.message}`);
  }

  return (data || []).map(sub => ({
    id: sub.id,
    name: sub.name,
    categoryId: sub.category_id,
  }));
}

/**
 * Get subcategories for a specific category
 */
export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching subcategories by category:', error);
    throw new Error(`Failed to fetch subcategories: ${error.message}`);
  }

  return (data || []).map(sub => ({
    id: sub.id,
    name: sub.name,
    categoryId: sub.category_id,
  }));
}

/**
 * Create a new category in Supabase
 */
export async function createCategory(name: string): Promise<Category> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
  };
}

/**
 * Create a new subcategory in Supabase
 */
export async function createSubcategory(name: string, categoryId: string): Promise<Subcategory> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('subcategories')
    .insert([{ name, category_id: categoryId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating subcategory:', error);
    throw new Error(`Failed to create subcategory: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    categoryId: data.category_id,
  };
}

/**
 * Delete a category from Supabase
 */
export async function deleteCategory(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

/**
 * Update a category name in Supabase
 */
export async function updateCategory(id: string, name: string): Promise<Category> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
  };
}

/**
 * Update a subcategory name in Supabase
 */
export async function updateSubcategory(id: string, name: string): Promise<Subcategory> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('subcategories')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subcategory:', error);
    throw new Error(`Failed to update subcategory: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    categoryId: data.category_id,
  };
}

/**
 * Delete a subcategory from Supabase
 */
export async function deleteSubcategory(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subcategory:', error);
    throw new Error(`Failed to delete subcategory: ${error.message}`);
  }
}
