import { supabase } from '@/lib/supabase';
import { StoreSettings } from '@/types';

interface SupabaseStoreSettings {
  id: string;
  hide_out_of_stock: boolean;
  updated_at: string;
}

function toStoreSettings(row: SupabaseStoreSettings): StoreSettings {
  return {
    id: row.id,
    hideOutOfStock: row.hide_out_of_stock,
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching store settings:', error);
    throw new Error(`Failed to fetch store settings: ${error.message}`);
  }

  return toStoreSettings(data as SupabaseStoreSettings);
}

export async function updateStoreSettings(
  settings: Partial<Omit<StoreSettings, 'id'>>
): Promise<StoreSettings> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  // Construir objeto de actualización con snake_case
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (settings.hideOutOfStock !== undefined) {
    updates.hide_out_of_stock = settings.hideOutOfStock;
  }

  // Actualizar la fila única (sin filtro WHERE, solo hay una fila)
  const { data, error } = await supabase
    .from('store_settings')
    .update(updates)
    .select()
    .single();

  if (error) {
    console.error('Error updating store settings:', error);
    throw new Error(`Failed to update store settings: ${error.message}`);
  }

  return toStoreSettings(data as SupabaseStoreSettings);
}
