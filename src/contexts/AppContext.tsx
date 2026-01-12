import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Order, Category, Subcategory, Brand, Label, OrderStatus, ProductCarouselState } from "@/types";
import {
  mockProducts,
  mockOrders,
  mockCategories,
  mockSubcategories,
  mockBrands,
  mockLabels,
  mockOrderStatuses,
  mockProductCarouselStates,
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
  addOrder: (order: Order) => void;
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

  // Product Carousel States
  productCarouselStates: ProductCarouselState[];
  addProductCarouselState: (state: ProductCarouselState) => void;
  deleteProductCarouselState: (id: string) => void;

  // Reset Store
  resetStore: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Display Settings
  hideOutOfStock: boolean;
  toggleHideOutOfStock: () => void;
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
  const [productCarouselStates, setProductCarouselStates] = useState<ProductCarouselState[]>(mockProductCarouselStates);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const savedHideOutOfStock = localStorage.getItem("hideOutOfStock");
    if (savedHideOutOfStock === "true") {
      setHideOutOfStock(true);
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

  const toggleHideOutOfStock = () => {
    setHideOutOfStock((prev) => {
      const newValue = !prev;
      localStorage.setItem("hideOutOfStock", newValue.toString());
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
  const addOrder = (order: Order) => {
    // Agregar el pedido
    setOrders((prev) => [...prev, order]);

    // Descontar stock de productos si tienen control de stock activado
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        // Buscar si este producto está en el pedido
        const orderItem = order.items.find((item) => item.productId === product.id);

        // Si el producto está en el pedido y tiene control de stock activado
        if (orderItem && product.trackStock) {
          return {
            ...product,
            stock: Math.max(0, product.stock - orderItem.quantity), // No permitir stock negativo
            updatedAt: new Date(),
          };
        }

        return product;
      })
    );
  };

  const updateOrder = (order: Order) => {
    // Encontrar el pedido original
    const originalOrder = orders.find((o) => o.id === order.id);

    // Actualizar el pedido
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));

    // Si no hay pedido original, no hacer cambios en el stock
    if (!originalOrder) return;

    // Ajustar stock de productos
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (!product.trackStock) return product;

        // Buscar item en pedido original y nuevo
        const originalItem = originalOrder.items.find((item) => item.productId === product.id);
        const newItem = order.items.find((item) => item.productId === product.id);

        let stockChange = 0;

        // Si estaba en el pedido original, restaurar ese stock
        if (originalItem) {
          stockChange += originalItem.quantity;
        }

        // Si está en el nuevo pedido, descontar ese stock
        if (newItem) {
          stockChange -= newItem.quantity;
        }

        // Aplicar cambio de stock si hay alguno
        if (stockChange !== 0) {
          return {
            ...product,
            stock: Math.max(0, product.stock + stockChange),
            updatedAt: new Date(),
          };
        }

        return product;
      })
    );
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

  // Product Carousel States
  const addProductCarouselState = (state: ProductCarouselState) => {
    setProductCarouselStates((prev) => [...prev, state]);
  };

  const deleteProductCarouselState = (id: string) => {
    setProductCarouselStates((prev) => prev.filter((s) => s.id !== id));
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
    setProductCarouselStates([]);
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
        addOrder,
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
        productCarouselStates,
        addProductCarouselState,
        deleteProductCarouselState,
        resetStore,
        isDarkMode,
        toggleDarkMode,
        hideOutOfStock,
        toggleHideOutOfStock,
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
