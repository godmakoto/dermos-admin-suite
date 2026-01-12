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
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  image_4: string | null;
  image_5: string | null;
  image_6: string | null;
  image_7: string | null;
  brand: string | null;
  label: string | null; // Product property (e.g., Nuevo, Popular)
  carousel_state: string | null;
  categories: string[]; // JSON array stored as JSONB
  subcategories: string[]; // JSON array stored as JSONB
  track_stock: boolean | null;
  stock: number | null;
  created_at: string; // ISO timestamp
  updated_at: string | null; // ISO timestamp
}

export interface Product {
  id: string;
  name: string;
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
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
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
  color: string;
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
