export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  brand: string;
  label: string;
  shortDescription: string;
  longDescription: string;
  usage: string;
  ingredients: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
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
