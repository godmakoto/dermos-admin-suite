import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductModal } from "@/components/products/ProductModal";
import { ProductCard } from "@/components/products/ProductCard";
import { useApp } from "@/contexts/AppContext";
import { Product } from "@/types";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const { products, categories, subcategories, brands, deleteProduct, duplicateProduct, updateProduct, hideOutOfStock } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Multi-selection states
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    brand: "",
    categories: [] as string[],
    subcategories: [] as string[],
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  // Infinite scroll states
  const [displayedCount, setDisplayedCount] = useState(20); // Show 20 products initially
  const observerTarget = useRef<HTMLDivElement>(null);

  const isSelectionMode = selectedProducts.length > 0;

  // Handlers that close the popover after changing filter
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setFilterPopoverOpen(false);
  };

  const handleBrandChange = (value: string) => {
    setBrandFilter(value);
    setFilterPopoverOpen(false);
  };

  const handleStockChange = (value: string) => {
    setStockFilter(value);
    setFilterPopoverOpen(false);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setFilterPopoverOpen(false);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setFilterPopoverOpen(false);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Hide out of stock filter (from settings - only applies to products with stock tracking)
    if (hideOutOfStock) {
      result = result.filter((p) => !p.trackStock || p.stock > 0);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.categories.some((cat) => cat.toLowerCase().includes(query)) ||
          p.subcategories.some((sub) => sub.toLowerCase().includes(query)) ||
          p.id.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.categories.includes(categoryFilter));
    }

    // Brand filter
    if (brandFilter !== "all") {
      result = result.filter((p) => p.brand === brandFilter);
    }

    // Stock filter (only apply to products with stock tracking enabled)
    if (stockFilter !== "all") {
      if (stockFilter === "inStock") {
        result = result.filter((p) => p.trackStock && p.stock > 0);
      } else if (stockFilter === "outOfStock") {
        result = result.filter((p) => p.trackStock && p.stock === 0);
      } else if (stockFilter === "lowStock") {
        result = result.filter((p) => p.trackStock && p.stock >= 1 && p.stock <= 10);
      } else if (stockFilter === "goodStock") {
        result = result.filter((p) => p.trackStock && p.stock > 10);
      }
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sort order
    if (sortOrder === "aToZ") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "zToA") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === "priceAsc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "priceDesc") {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Por defecto: más recientes primero
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, searchQuery, categoryFilter, brandFilter, stockFilter, statusFilter, sortOrder, hideOutOfStock]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(20);
  }, [searchQuery, categoryFilter, brandFilter, stockFilter, statusFilter, sortOrder]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredProducts.length) {
          // Load 20 more products
          setDisplayedCount((prev) => Math.min(prev + 20, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayedCount, filteredProducts.length]);

  // Slice filtered products to show only the displayed count
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayedCount);
  }, [filteredProducts, displayedCount]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProduct(id);
      toast({ title: "Producto eliminado", description: "El producto se ha eliminado correctamente." });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar el producto.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateProduct(id);
      toast({ title: "Producto duplicado", description: "Se ha creado una copia del producto." });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo duplicar el producto.",
        variant: "destructive"
      });
    }
  };

  // Multi-selection handlers
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleLongPress = (productId: string) => {
    // Activar modo selección y seleccionar el producto
    if (!isSelectionMode) {
      setSelectedProducts([productId]);
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  const handleBulkEdit = () => {
    setBulkEditModalOpen(true);
  };

  const handleApplyBulkEdit = async () => {
    let updatedCount = 0;
    const errors: string[] = [];

    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const updates: Partial<Product> = {};

        if (bulkEditData.brand) {
          updates.brand = bulkEditData.brand;
        }

        // Add selected categories (merge with existing, no duplicates)
        if (bulkEditData.categories.length > 0) {
          const existingCategories = product.categories || [];
          const mergedCategories = [...new Set([...existingCategories, ...bulkEditData.categories])];
          updates.categories = mergedCategories;
        }

        // Add selected subcategories (merge with existing, no duplicates)
        if (bulkEditData.subcategories.length > 0) {
          const existingSubcategories = product.subcategories || [];
          const mergedSubcategories = [...new Set([...existingSubcategories, ...bulkEditData.subcategories])];
          updates.subcategories = mergedSubcategories;
        }

        if (Object.keys(updates).length > 0) {
          try {
            await updateProduct({ ...product, ...updates });
            updatedCount++;
          } catch (error) {
            errors.push(product.name);
          }
        }
      }
    }

    setBulkEditModalOpen(false);
    setSelectedProducts([]);
    setBulkEditData({ brand: "", categories: [], subcategories: [] });

    if (errors.length > 0) {
      toast({
        title: "Algunos productos no se actualizaron",
        description: `${updatedCount} actualizados, ${errors.length} fallidos.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Productos actualizados",
        description: `${updatedCount} ${updatedCount === 1 ? 'producto actualizado' : 'productos actualizados'} correctamente.`,
      });
    }
  };

  // Stock summary (only count products with stock tracking enabled)
  const totalProducts = products.length;
  const stockBajo = products.filter((p) => p.trackStock && p.stock >= 1 && p.stock <= 10).length;
  const agotados = products.filter((p) => p.trackStock && p.stock === 0).length;
  const buenStock = products.filter((p) => p.trackStock && p.stock > 10).length;

  return (
    <AppLayout>
      <PageHeader
        title="Productos"
        description={`${filteredProducts.length} productos`}
      >
        <Button onClick={handleCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
      </PageHeader>

      {/* Stock Summary - 2x2 Grid mobile, 1x4 Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {/* Total */}
        <button
          onClick={() => setStockFilter("all")}
          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-all border-2 ${
            stockFilter === "all"
              ? "bg-secondary border-secondary"
              : "bg-secondary/50 border-secondary/50 hover:bg-secondary hover:border-secondary"
          }`}
        >
          <span className="text-muted-foreground font-medium">Total</span>
          <span className="font-semibold">{totalProducts}</span>
        </button>

        {/* Good Stock */}
        <button
          onClick={() => setStockFilter(stockFilter === "goodStock" ? "all" : "goodStock")}
          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
            stockFilter === "goodStock"
              ? "bg-success text-success-foreground ring-2 ring-success"
              : "bg-success/10 text-success hover:bg-success/20"
          }`}
        >
          <span className="font-medium">Buen stock</span>
          <span className="font-semibold">{buenStock}</span>
        </button>

        {/* Low Stock */}
        <button
          onClick={() => setStockFilter(stockFilter === "lowStock" ? "all" : "lowStock")}
          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
            stockFilter === "lowStock"
              ? "bg-warning text-warning-foreground ring-2 ring-warning"
              : "bg-warning/10 text-warning hover:bg-warning/20"
          }`}
        >
          <span className="font-medium">Stock bajo</span>
          <span className="font-semibold">{stockBajo}</span>
        </button>

        {/* Out of Stock */}
        <button
          onClick={() => setStockFilter(stockFilter === "outOfStock" ? "all" : "outOfStock")}
          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
            stockFilter === "outOfStock"
              ? "bg-destructive text-destructive-foreground ring-2 ring-destructive"
              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
          }`}
        >
          <span className="font-medium">Agotados</span>
          <span className="font-semibold">{agotados}</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
            autoComplete="chrome-off"
            autoCorrect="off"
            autoCapitalize="off"
            data-form-type="other"
          />
        </div>
        
        {/* Mobile filter button */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="flex flex-col gap-2">
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={brandFilter} onValueChange={handleBrandChange}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las marcas</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Por defecto</SelectItem>
                  <SelectItem value="aToZ">A-Z</SelectItem>
                  <SelectItem value="zToA">Z-A</SelectItem>
                  <SelectItem value="priceAsc">Precio ↑</SelectItem>
                  <SelectItem value="priceDesc">Precio ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Desktop filters */}
        <div className="hidden lg:flex lg:gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.name}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-32 h-10">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Defecto</SelectItem>
              <SelectItem value="aToZ">A-Z</SelectItem>
              <SelectItem value="zToA">Z-A</SelectItem>
              <SelectItem value="priceAsc">Precio ↑</SelectItem>
              <SelectItem value="priceDesc">Precio ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Cards */}
      <div className="space-y-2">
        {filteredProducts.length > 0 ? (
          <>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => !isSelectionMode && handleEdit(product)}
                onDelete={(e) => handleDelete(product.id, e)}
                onDuplicate={(e) => handleDuplicate(product.id, e)}
                isSelected={selectedProducts.includes(product.id)}
                onSelect={(checked) => handleSelectProduct(product.id, checked)}
                onLongPress={() => handleLongPress(product.id)}
                isSelectionMode={isSelectionMode}
              />
            ))}

            {/* Intersection observer target */}
            {displayedCount < filteredProducts.length && (
              <div ref={observerTarget} className="flex justify-center py-4">
                <div className="text-sm text-muted-foreground">
                  Cargando más productos... ({displayedCount} de {filteredProducts.length})
                </div>
              </div>
            )}

            {/* Show completion message when all products are loaded */}
            {displayedCount >= filteredProducts.length && filteredProducts.length > 20 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Mostrando todos los {filteredProducts.length} productos
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            No hay productos
          </div>
        )}
      </div>

      {/* Floating action bar for bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 z-40 bg-foreground text-background rounded-full shadow-lg px-4 py-2.5 flex items-center justify-between lg:justify-start gap-3">
          <span className="text-sm font-medium">
            {selectedProducts.length} seleccionados
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkEdit}
            className="rounded-full h-8"
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="rounded-full h-8 text-background hover:bg-background/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />

      {/* Bulk Edit Modal */}
      <Dialog open={bulkEditModalOpen} onOpenChange={setBulkEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {selectedProducts.length} productos</DialogTitle>
            <DialogDescription>
              Las categorías y subcategorías se agregarán a las existentes. La marca reemplazará la actual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select value={bulkEditData.brand} onValueChange={(value) => setBulkEditData({ ...bulkEditData, brand: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin cambios" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categorías (se agregan a las existentes)</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay categorías disponibles</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`bulk-cat-${cat.id}`}
                        checked={bulkEditData.categories.includes(cat.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkEditData({
                              ...bulkEditData,
                              categories: [...bulkEditData.categories, cat.name],
                            });
                          } else {
                            setBulkEditData({
                              ...bulkEditData,
                              categories: bulkEditData.categories.filter((c) => c !== cat.name),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`bulk-cat-${cat.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cat.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subcategorías (se agregan a las existentes)</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {subcategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay subcategorías disponibles</p>
                ) : (
                  subcategories.map((sub) => {
                    const category = categories.find((c) => c.id === sub.categoryId);
                    return (
                      <div key={sub.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bulk-sub-${sub.id}`}
                          checked={bulkEditData.subcategories.includes(sub.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkEditData({
                                ...bulkEditData,
                                subcategories: [...bulkEditData.subcategories, sub.name],
                              });
                            } else {
                              setBulkEditData({
                                ...bulkEditData,
                                subcategories: bulkEditData.subcategories.filter((s) => s !== sub.name),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`bulk-sub-${sub.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {sub.name} {category && <span className="text-muted-foreground">({category.name})</span>}
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyBulkEdit}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Products;
