import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const { products, categories, brands, deleteProduct, duplicateProduct, updateProduct } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Multi-selection states
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    category: "",
    subcategory: "",
    brand: "",
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Brand filter
    if (brandFilter !== "all") {
      result = result.filter((p) => p.brand === brandFilter);
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "inStock") {
        result = result.filter((p) => p.stock > 0);
      } else if (stockFilter === "outOfStock") {
        result = result.filter((p) => p.stock === 0);
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
    }

    return result;
  }, [products, searchQuery, categoryFilter, brandFilter, stockFilter, statusFilter, sortOrder]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProduct(id);
    toast({ title: "Producto eliminado", description: "El producto se ha eliminado correctamente." });
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateProduct(id);
    toast({ title: "Producto duplicado", description: "Se ha creado una copia del producto." });
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

  const handleApplyBulkEdit = () => {
    let updatedCount = 0;

    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const updates: Partial<Product> = {};

        if (bulkEditData.category) {
          updates.category = bulkEditData.category;
        }
        if (bulkEditData.subcategory) {
          updates.subcategory = bulkEditData.subcategory;
        }
        if (bulkEditData.brand) {
          updates.brand = bulkEditData.brand;
        }

        if (Object.keys(updates).length > 0) {
          updateProduct({ ...product, ...updates });
          updatedCount++;
        }
      }
    });

    setBulkEditModalOpen(false);
    setSelectedProducts([]);
    setBulkEditData({ category: "", subcategory: "", brand: "" });

    toast({
      title: "Productos actualizados",
      description: `${updatedCount} ${updatedCount === 1 ? 'producto actualizado' : 'productos actualizados'} correctamente.`,
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Productos"
        description={`${filteredProducts.length} productos encontrados`}
      >
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        {/* Search bar with mobile filter button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, marca o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Mobile filter button */}
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="flex flex-col gap-3">
                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas las categorías" />
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas las marcas" />
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

                <Select value={stockFilter} onValueChange={handleStockChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todo el stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo el stock</SelectItem>
                    <SelectItem value="inStock">En stock</SelectItem>
                    <SelectItem value="outOfStock">Sin stock</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Agotado">Agotado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ordenar por..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Por defecto</SelectItem>
                    <SelectItem value="aToZ">Nombre A-Z</SelectItem>
                    <SelectItem value="zToA">Nombre Z-A</SelectItem>
                    <SelectItem value="priceAsc">Precio menor</SelectItem>
                    <SelectItem value="priceDesc">Precio mayor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Desktop filters - hidden on mobile */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-3 mt-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las categorías" />
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

          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las marcas" />
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

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todo el stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el stock</SelectItem>
              <SelectItem value="inStock">En stock</SelectItem>
              <SelectItem value="outOfStock">Sin stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Agotado">Agotado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Por defecto</SelectItem>
              <SelectItem value="aToZ">Nombre A-Z</SelectItem>
              <SelectItem value="zToA">Nombre Z-A</SelectItem>
              <SelectItem value="priceAsc">Precio menor</SelectItem>
              <SelectItem value="priceDesc">Precio mayor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Cards */}
      <div className="space-y-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
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
          ))
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            No hay productos. Crea tu primer producto para comenzar.
          </div>
        )}
      </div>

      {/* Floating action bar for bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedProducts.length} {selectedProducts.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkEdit}
              className="rounded-full"
            >
              Editar selección
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="rounded-full text-primary-foreground hover:bg-primary-foreground/20"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Stock Indicators */}
      {(() => {
        const totalProducts = products.length;
        const stockBajo = products.filter((p) => p.stock >= 1 && p.stock <= 10).length;
        const stockMedio = products.filter((p) => p.stock >= 11 && p.stock <= 30).length;
        const agotados = products.filter((p) => p.stock === 0).length;

        return (
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Indicadores de Stock</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Productos */}
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Productos</span>
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-3xl font-bold text-foreground">{totalProducts}</span>
              </div>

              {/* Stock Bajo */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Stock Bajo</span>
                  <div className="h-2 w-2 rounded-full bg-muted"></div>
                </div>
                <span className="text-3xl font-bold text-amber-500">{stockBajo}</span>
                <p className="text-xs text-muted-foreground mt-1">1-10 unidades</p>
              </div>

              {/* Stock Medio */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Stock Medio</span>
                  <div className="h-2 w-2 rounded-full bg-muted"></div>
                </div>
                <span className="text-3xl font-bold text-green-500">{stockMedio}</span>
                <p className="text-xs text-muted-foreground mt-1">11-30 unidades</p>
              </div>

              {/* Agotados */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Agotados</span>
                  <div className="h-2 w-2 rounded-full bg-muted"></div>
                </div>
                <span className="text-3xl font-bold text-red-500">{agotados}</span>
                <p className="text-xs text-muted-foreground mt-1">0 unidades</p>
              </div>
            </div>
          </div>
        );
      })()}

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />

      {/* Bulk Edit Modal */}
      <Dialog open={bulkEditModalOpen} onOpenChange={setBulkEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar {selectedProducts.length} productos</DialogTitle>
            <DialogDescription>
              Los campos que dejes vacíos no se modificarán. Solo se actualizarán los campos que selecciones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-category">Categoría</Label>
              <Select
                value={bulkEditData.category}
                onValueChange={(value) => setBulkEditData({ ...bulkEditData, category: value })}
              >
                <SelectTrigger id="bulk-category">
                  <SelectValue placeholder="Seleccionar categoría (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin cambios</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-subcategory">Subcategoría</Label>
              <Input
                id="bulk-subcategory"
                placeholder="Subcategoría (opcional)"
                value={bulkEditData.subcategory}
                onChange={(e) => setBulkEditData({ ...bulkEditData, subcategory: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Escribe la subcategoría o déjalo vacío para no modificar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-brand">Marca</Label>
              <Select
                value={bulkEditData.brand}
                onValueChange={(value) => setBulkEditData({ ...bulkEditData, brand: value })}
              >
                <SelectTrigger id="bulk-brand">
                  <SelectValue placeholder="Seleccionar marca (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin cambios</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkEditModalOpen(false);
                setBulkEditData({ category: "", subcategory: "", brand: "" });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleApplyBulkEdit}>
              Aplicar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Products;
