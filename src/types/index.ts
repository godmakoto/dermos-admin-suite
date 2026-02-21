export type ProductStatus = "Activo" | "Inactivo" | "Agotado";

// Supabase database schema for products table
export interface SupabaseProduct {
  id: string; // UUID
  product_id: string | null; // product code
  title: string | null;
  offer_price: number | null;
  regular_price: number | null;
  long_description: string | null;
  short_description: string | null;
  description: string | null; // Additional description field from DB
  usage_instructions: string | null;
  ingredients: string | null;
  brand: string | null;
  label: string | null; // Product property (e.g., Nuevo, Popular)
  carousel_state: string | null;
  categories: string[]; // JSON array stored as JSONB
  subcategories: string[]; // JSON array stored as JSONB
  short_title: string | null;
  track_stock: boolean | null;
  stock: number | null;
  created_at: string; // ISO timestamp
  updated_at: string | null; // ISO timestamp
}

export interface SupabaseProductImage {
  id: number;
  created_at: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  position: number;
}

export interface SupabaseProductWithImages extends SupabaseProduct {
  product_images: SupabaseProductImage[];
}

export interface Product {
  id: string;
  name: string;
  shortTitle: string;
  price: number;
  salePrice?: number;
  categories: string[];
  subcategories: string[];
  brand: string;
  label: string;
  carouselState: string;
  shortDescription: string;
  longDescription: string;
  usage: string;
  ingredients: string;
  images: string[];
  trackStock: boolean;
  stock: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number; // Manual additional discount
  product_discounts: number; // Automatic discounts from sale prices
  total: number;
  status: string;
  status_id: string;
  notes: string | null;
  payment_method: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Supabase types for orders
export interface SupabaseOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  items: OrderItem[]; // JSONB array
  subtotal: number;
  discount: number; // Manual additional discount
  product_discounts: number; // Automatic discounts from sale prices
  total: number;
  status_id: string;
  notes: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Label {
  id: string;
  name: string;
}

export interface OrderStatus {
  id: string;
  name: string;
  color: string;
}

export interface ProductCarouselState {
  id: string;
  name: string;
  type: "carousel" | "banner";
  color: string;
}

export interface StoreSettings {
  id: string;
  hideOutOfStock: boolean;
}
