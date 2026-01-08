export type ProductStatus = "Activo" | "Inactivo" | "Agotado";

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory: string;
  brand: string;
  label: string;
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
