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
import * as productService from "@/services/productService";
import * as categoryService from "@/services/categoryService";
import { supabase } from "@/lib/supabase";

interface AppContextType {
  // Products
  products: Product[];
  isLoadingProducts: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  deleteAllProducts: () => void;
  importProducts: (products: Product[]) => void;
  refreshProducts: () => Promise<void>;

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(mockSubcategories);
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [labels, setLabels] = useState<Label[]>(mockLabels);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>(mockOrderStatuses);
  const [productCarouselStates, setProductCarouselStates] = useState<ProductCarouselState[]>(mockProductCarouselStates);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  // Load products from Supabase on mount
  useEffect(() => {
    const loadProducts = async () => {
      if (supabase) {
        try {
          setIsLoadingProducts(true);
          const fetchedProducts = await productService.getProducts();
          setProducts(fetchedProducts);
        } catch (error) {
          console.error('Failed to load products from Supabase:', error);
          // Fallback to mock data if Supabase fails
          setProducts(mockProducts);
        } finally {
          setIsLoadingProducts(false);
        }
      } else {
        // Use mock data if Supabase is not configured
        setProducts(mockProducts);
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Load categories and subcategories from Supabase on mount
  useEffect(() => {
    const loadCategoriesAndSubcategories = async () => {
      if (supabase) {
        try {
          const [fetchedCategories, fetchedSubcategories] = await Promise.all([
            categoryService.getCategories(),
            categoryService.getSubcategories(),
          ]);
          setCategories(fetchedCategories);
          setSubcategories(fetchedSubcategories);
        } catch (error) {
          console.error('Failed to load categories from Supabase:', error);
          // Fallback to mock data if Supabase fails
          setCategories(mockCategories);
          setSubcategories(mockSubcategories);
        }
      } else {
        // Use mock data if Supabase is not configured
        setCategories(mockCategories);
        setSubcategories(mockSubcategories);
      }
    };

    loadCategoriesAndSubcategories();
  }, []);

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
  const refreshProducts = async () => {
    if (supabase) {
      try {
        setIsLoadingProducts(true);
        const fetchedProducts = await productService.getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to refresh products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
  };

  const addProduct = async (product: Product) => {
    if (supabase) {
      try {
        const newProduct = await productService.createProduct(product);
        setProducts((prev) => [newProduct, ...prev]);
      } catch (error) {
        console.error('Failed to create product:', error);
        throw error;
      }
    } else {
      setProducts((prev) => [...prev, product]);
    }
  };

  const updateProduct = async (product: Product) => {
    if (supabase) {
      try {
        const updatedProduct = await productService.updateProduct(product.id, product);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? updatedProduct : p)));
      } catch (error) {
        console.error('Failed to update product:', error);
        throw error;
      }
    } else {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    }
  };

  const deleteProduct = async (id: string) => {
    if (supabase) {
      try {
        await productService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Failed to delete product:', error);
        throw error;
      }
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const deleteAllProducts = async () => {
    if (supabase) {
      // For Supabase, we delete products sequentially to avoid rate limits
      try {
        for (const product of products) {
          await productService.deleteProduct(product.id);
        }
        setProducts([]);
      } catch (error) {
        console.error('Failed to delete all products:', error);
        throw error;
      }
    } else {
      setProducts([]);
    }
  };

  const importProducts = async (newProducts: Product[]) => {
    if (supabase) {
      try {
        const createdProducts = await Promise.all(
          newProducts.map(p => productService.createProduct(p))
        );
        setProducts((prev) => [...prev, ...createdProducts]);
      } catch (error) {
        console.error('Failed to import products:', error);
        throw error;
      }
    } else {
      setProducts((prev) => [...prev, ...newProducts]);
    }
  };

  const duplicateProduct = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      const newProduct: Product = {
        ...product,
        id: crypto.randomUUID(), // Generate new UUID for Supabase
        name: `${product.name} (Copia)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      if (supabase) {
        try {
          const created = await productService.createProduct(newProduct);
          setProducts((prev) => [created, ...prev]);
        } catch (error) {
          console.error('Failed to duplicate product:', error);
          throw error;
        }
      } else {
        const localProduct: Product = {
          ...newProduct,
          id: `${Date.now()}`,
        };
        setProducts((prev) => [...prev, localProduct]);
      }
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
  const addCategory = async (category: Category) => {
    if (supabase) {
      try {
        const newCategory = await categoryService.createCategory(category.name);
        setCategories((prev) => [...prev, newCategory]);
      } catch (error) {
        console.error('Failed to create category:', error);
        throw error;
      }
    } else {
      setCategories((prev) => [...prev, category]);
    }
  };

  const deleteCategory = async (id: string) => {
    if (supabase) {
      try {
        await categoryService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        // Also remove related subcategories from local state
        setSubcategories((prev) => prev.filter((s) => s.categoryId !== id));
      } catch (error) {
        console.error('Failed to delete category:', error);
        throw error;
      }
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const deleteAllCategories = async () => {
    if (supabase) {
      try {
        // Delete all categories one by one
        for (const category of categories) {
          await categoryService.deleteCategory(category.id);
        }
        setCategories([]);
        setSubcategories([]); // Clear subcategories too
      } catch (error) {
        console.error('Failed to delete all categories:', error);
        throw error;
      }
    } else {
      setCategories([]);
    }
  };

  // Subcategories
  const addSubcategory = async (subcategory: Subcategory) => {
    if (supabase) {
      try {
        const newSubcategory = await categoryService.createSubcategory(
          subcategory.name,
          subcategory.categoryId
        );
        setSubcategories((prev) => [...prev, newSubcategory]);
      } catch (error) {
        console.error('Failed to create subcategory:', error);
        throw error;
      }
    } else {
      setSubcategories((prev) => [...prev, subcategory]);
    }
  };

  const deleteSubcategory = async (id: string) => {
    if (supabase) {
      try {
        await categoryService.deleteSubcategory(id);
        setSubcategories((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete subcategory:', error);
        throw error;
      }
    } else {
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const deleteAllSubcategories = async () => {
    if (supabase) {
      try {
        // Delete all subcategories one by one
        for (const subcategory of subcategories) {
          await categoryService.deleteSubcategory(subcategory.id);
        }
        setSubcategories([]);
      } catch (error) {
        console.error('Failed to delete all subcategories:', error);
        throw error;
      }
    } else {
      setSubcategories([]);
    }
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
        isLoadingProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        deleteAllProducts,
        importProducts,
        refreshProducts,
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
