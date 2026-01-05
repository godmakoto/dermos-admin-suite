import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Order, Category, Subcategory, Brand, Label, OrderStatus } from "@/types";
import {
  mockProducts,
  mockOrders,
  mockCategories,
  mockSubcategories,
  mockBrands,
  mockLabels,
  mockOrderStatuses,
} from "@/data/mockData";

interface AppContextType {
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  deleteAllProducts: () => void;
  importProducts: (products: Product[]) => void;

  // Orders
  orders: Order[];
  updateOrder: (order: Order) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  deleteAllCategories: () => void;

  // Subcategories
  subcategories: Subcategory[];
  addSubcategory: (subcategory: Subcategory) => void;
  deleteSubcategory: (id: string) => void;
  deleteAllSubcategories: () => void;

  // Brands
  brands: Brand[];
  addBrand: (brand: Brand) => void;
  deleteBrand: (id: string) => void;

  // Labels
  labels: Label[];
  addLabel: (label: Label) => void;
  deleteLabel: (id: string) => void;
  deleteAllLabels: () => void;

  // Order Statuses
  orderStatuses: OrderStatus[];
  addOrderStatus: (status: OrderStatus) => void;
  deleteOrderStatus: (id: string) => void;

  // Reset Store
  resetStore: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(mockSubcategories);
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [labels, setLabels] = useState<Label[]>(mockLabels);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>(mockOrderStatuses);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newValue;
    });
  };

  // Products
  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteAllProducts = () => {
    setProducts([]);
  };

  const importProducts = (newProducts: Product[]) => {
    setProducts((prev) => [...prev, ...newProducts]);
  };

  const duplicateProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      const newProduct: Product = {
        ...product,
        id: `${Date.now()}`,
        name: `${product.name} (Copia)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts((prev) => [...prev, newProduct]);
    }
  };

  // Orders
  const updateOrder = (order: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
  };

  // Categories
  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const deleteAllCategories = () => {
    setCategories([]);
  };

  // Subcategories
  const addSubcategory = (subcategory: Subcategory) => {
    setSubcategories((prev) => [...prev, subcategory]);
  };

  const deleteSubcategory = (id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteAllSubcategories = () => {
    setSubcategories([]);
  };

  // Brands
  const addBrand = (brand: Brand) => {
    setBrands((prev) => [...prev, brand]);
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  // Labels
  const addLabel = (label: Label) => {
    setLabels((prev) => [...prev, label]);
  };

  const deleteLabel = (id: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== id));
  };

  const deleteAllLabels = () => {
    setLabels([]);
  };

  // Order Statuses
  const addOrderStatus = (status: OrderStatus) => {
    setOrderStatuses((prev) => [...prev, status]);
  };

  const deleteOrderStatus = (id: string) => {
    setOrderStatuses((prev) => prev.filter((s) => s.id !== id));
  };

  // Reset Store
  const resetStore = () => {
    setProducts([]);
    setOrders([]);
    setCategories([]);
    setSubcategories([]);
    setBrands([]);
    setLabels([]);
    setOrderStatuses([]);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        deleteAllProducts,
        importProducts,
        orders,
        updateOrder,
        categories,
        addCategory,
        deleteCategory,
        deleteAllCategories,
        subcategories,
        addSubcategory,
        deleteSubcategory,
        deleteAllSubcategories,
        brands,
        addBrand,
        deleteBrand,
        labels,
        addLabel,
        deleteLabel,
        deleteAllLabels,
        orderStatuses,
        addOrderStatus,
        deleteOrderStatus,
        resetStore,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
