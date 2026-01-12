export type ProductStatus = "Activo" | "Inactivo" | "Agotado";

// Supabase database schema for products table
export interface SupabaseProduct {
  id: string; // UUID
  product_id: string; // product code
  title: string;
  offer_price: number | null;
  regular_price: number;
  long_description: string;
  image_1: string;
  image_2: string | null;
  image_3: string | null;
  image_4: string | null;
  image_5: string | null;
  image_6: string | null;
  image_7: string | null;
  created_at: string; // ISO timestamp
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
