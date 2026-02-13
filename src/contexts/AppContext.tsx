import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Order, Category, Subcategory, Brand, Label, OrderStatus, ProductCarouselState } from "@/types";
import {
  mockProducts,
  mockCategories,
  mockSubcategories,
  mockBrands,
  mockLabels,
  mockOrderStatuses,
  mockProductCarouselStates,
} from "@/data/mockData";
import * as productService from "@/services/productService";
import * as categoryService from "@/services/categoryService";
import * as brandService from "@/services/brandService";
import * as orderService from "@/services/orderService";
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
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => void;
  deleteAllCategories: () => void;

  // Subcategories
  subcategories: Subcategory[];
  addSubcategory: (subcategory: Subcategory) => void;
  updateSubcategory: (id: string, name: string) => Promise<void>;
  deleteSubcategory: (id: string) => void;
  deleteAllSubcategories: () => void;

  // Brands
  brands: Brand[];
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, name: string) => Promise<void>;
  deleteBrand: (id: string) => void;

  // Labels
  labels: Label[];
  addLabel: (label: Label) => void;
  updateLabel: (id: string, name: string) => Promise<void>;
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
  const [orders, setOrders] = useState<Order[]>([]);
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

  // Load brands, labels, carousel states, and order statuses from Supabase on mount
  useEffect(() => {
    const loadBrandsAndLabels = async () => {
      if (supabase) {
        try {
          const [fetchedBrands, fetchedLabels, fetchedCarouselStates, fetchedOrderStatuses] = await Promise.all([
            brandService.getBrands(),
            brandService.getLabels(),
            brandService.getProductCarouselStates(),
            brandService.getOrderStatuses(),
          ]);
          setBrands(fetchedBrands);
          setLabels(fetchedLabels);
          setProductCarouselStates(fetchedCarouselStates);
          setOrderStatuses(fetchedOrderStatuses);
        } catch (error) {
          console.error('Failed to load brands/labels from Supabase:', error);
          // Fallback to mock data if Supabase fails
          setBrands(mockBrands);
          setLabels(mockLabels);
          setProductCarouselStates(mockProductCarouselStates);
          setOrderStatuses(mockOrderStatuses);
        }
      } else {
        // Use mock data if Supabase is not configured
        setBrands(mockBrands);
        setLabels(mockLabels);
        setProductCarouselStates(mockProductCarouselStates);
        setOrderStatuses(mockOrderStatuses);
      }
    };

    loadBrandsAndLabels();
  }, []);

  // Load orders from Supabase on mount (after orderStatuses are loaded)
  useEffect(() => {
    const loadOrders = async () => {
      if (supabase && orderStatuses.length > 0) {
        try {
          const fetchedOrders = await orderService.getOrders(orderStatuses);
          setOrders(fetchedOrders);
        } catch (error) {
          console.error('Failed to load orders from Supabase:', error);
          setOrders([]);
        }
      } else if (!supabase) {
        console.warn('Supabase is not configured. Orders will be empty.');
        setOrders([]);
      }
    };

    loadOrders();
  }, [orderStatuses]);

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

  // Un estado "retiene stock" si NO es Cancelado (Pendiente y Finalizado descuentan stock)
  const statusHoldsStock = (statusName: string): boolean => statusName !== "Cancelado";

  // Orders
  const addOrder = async (order: Order) => {
    if (supabase) {
      try {
        const newOrder = await orderService.createOrder(order);
        setOrders((prev) => [...prev, newOrder]);

        // Descontar stock solo si el estado del pedido retiene stock
        if (statusHoldsStock(order.status)) {
          setProducts((prevProducts) =>
            prevProducts.map((product) => {
              const orderItem = order.items.find((item) => item.product_id === product.id);

              if (orderItem && product.trackStock) {
                return {
                  ...product,
                  stock: Math.max(0, product.stock - orderItem.quantity),
                  updatedAt: new Date(),
                };
              }

              return product;
            })
          );
        }
      } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
      }
    } else {
      // Fallback to local state if Supabase is not configured
      setOrders((prev) => [...prev, order]);
    }
  };

  const updateOrder = async (order: Order) => {
    if (supabase) {
      try {
        const updatedOrder = await orderService.updateOrder(order);

        // Encontrar el pedido original
        const originalOrder = orders.find((o) => o.id === order.id);

        // Actualizar el pedido en el estado local
        setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));

        // Si no hay pedido original, no hacer cambios en el stock
        if (!originalOrder) return;

        // Determinar si el estado anterior/nuevo retiene stock
        const oldHoldsStock = statusHoldsStock(originalOrder.status);
        const newHoldsStock = statusHoldsStock(order.status);

        // Ajustar stock de productos según cambio de estado y/o items
        setProducts((prevProducts) =>
          prevProducts.map((product) => {
            if (!product.trackStock) return product;

            const originalItem = originalOrder.items.find((item) => item.product_id === product.id);
            const newItem = order.items.find((item) => item.product_id === product.id);

            let stockChange = 0;

            // Restaurar stock solo si el estado anterior retenía stock
            if (oldHoldsStock && originalItem) {
              stockChange += originalItem.quantity;
            }

            // Descontar stock solo si el nuevo estado retiene stock
            if (newHoldsStock && newItem) {
              stockChange -= newItem.quantity;
            }

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
      } catch (error) {
        console.error('Failed to update order:', error);
        throw error;
      }
    } else {
      // Fallback to local state if Supabase is not configured
      const originalOrder = orders.find((o) => o.id === order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      // Stock adjustment logic remains the same for local state
    }
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

  const updateCategory = async (id: string, name: string) => {
    if (supabase) {
      try {
        const updated = await categoryService.updateCategory(id, name);
        setCategories((prev) => prev.map((c) => c.id === id ? updated : c));
      } catch (error) {
        console.error('Failed to update category:', error);
        throw error;
      }
    } else {
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name } : c));
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

  const updateSubcategory = async (id: string, name: string) => {
    if (supabase) {
      try {
        const updated = await categoryService.updateSubcategory(id, name);
        setSubcategories((prev) => prev.map((s) => s.id === id ? updated : s));
      } catch (error) {
        console.error('Failed to update subcategory:', error);
        throw error;
      }
    } else {
      setSubcategories((prev) => prev.map((s) => s.id === id ? { ...s, name } : s));
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
  const addBrand = async (brand: Brand) => {
    if (supabase) {
      try {
        const newBrand = await brandService.createBrand(brand.name);
        setBrands((prev) => [...prev, newBrand]);
      } catch (error) {
        console.error('Failed to create brand:', error);
        throw error;
      }
    } else {
      setBrands((prev) => [...prev, brand]);
    }
  };

  const updateBrand = async (id: string, name: string) => {
    if (supabase) {
      try {
        const updated = await brandService.updateBrand(id, name);
        setBrands((prev) => prev.map((b) => b.id === id ? updated : b));
      } catch (error) {
        console.error('Failed to update brand:', error);
        throw error;
      }
    } else {
      setBrands((prev) => prev.map((b) => b.id === id ? { ...b, name } : b));
    }
  };

  const deleteBrand = async (id: string) => {
    if (supabase) {
      try {
        await brandService.deleteBrand(id);
        setBrands((prev) => prev.filter((b) => b.id !== id));
      } catch (error) {
        console.error('Failed to delete brand:', error);
        throw error;
      }
    } else {
      setBrands((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Labels
  const addLabel = async (label: Label) => {
    if (supabase) {
      try {
        const newLabel = await brandService.createLabel(label.name);
        setLabels((prev) => [...prev, newLabel]);
      } catch (error) {
        console.error('Failed to create label:', error);
        throw error;
      }
    } else {
      setLabels((prev) => [...prev, label]);
    }
  };

  const updateLabel = async (id: string, name: string) => {
    if (supabase) {
      try {
        const updated = await brandService.updateLabel(id, name);
        setLabels((prev) => prev.map((l) => l.id === id ? updated : l));
      } catch (error) {
        console.error('Failed to update label:', error);
        throw error;
      }
    } else {
      setLabels((prev) => prev.map((l) => l.id === id ? { ...l, name } : l));
    }
  };

  const deleteLabel = async (id: string) => {
    if (supabase) {
      try {
        await brandService.deleteLabel(id);
        setLabels((prev) => prev.filter((l) => l.id !== id));
      } catch (error) {
        console.error('Failed to delete label:', error);
        throw error;
      }
    } else {
      setLabels((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const deleteAllLabels = async () => {
    if (supabase) {
      try {
        // Delete all labels one by one
        for (const label of labels) {
          await brandService.deleteLabel(label.id);
        }
        setLabels([]);
      } catch (error) {
        console.error('Failed to delete all labels:', error);
        throw error;
      }
    } else {
      setLabels([]);
    }
  };

  // Order Statuses
  const addOrderStatus = async (status: OrderStatus) => {
    if (supabase) {
      try {
        const newStatus = await brandService.createOrderStatus(status.name, status.color);
        setOrderStatuses((prev) => [...prev, newStatus]);
      } catch (error) {
        console.error('Failed to create order status:', error);
        throw error;
      }
    } else {
      setOrderStatuses((prev) => [...prev, status]);
    }
  };

  const deleteOrderStatus = async (id: string) => {
    if (supabase) {
      try {
        await brandService.deleteOrderStatus(id);
        setOrderStatuses((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete order status:', error);
        throw error;
      }
    } else {
      setOrderStatuses((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Product Carousel States
  const addProductCarouselState = async (state: ProductCarouselState) => {
    if (supabase) {
      try {
        const newState = await brandService.createProductCarouselState(state.name, state.type, state.color);
        setProductCarouselStates((prev) => [...prev, newState]);
      } catch (error) {
        console.error('Failed to create carousel state:', error);
        throw error;
      }
    } else {
      setProductCarouselStates((prev) => [...prev, state]);
    }
  };

  const deleteProductCarouselState = async (id: string) => {
    if (supabase) {
      try {
        await brandService.deleteProductCarouselState(id);
        setProductCarouselStates((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete carousel state:', error);
        throw error;
      }
    } else {
      setProductCarouselStates((prev) => prev.filter((s) => s.id !== id));
    }
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
        updateCategory,
        deleteCategory,
        deleteAllCategories,
        subcategories,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        deleteAllSubcategories,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        labels,
        addLabel,
        updateLabel,
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
