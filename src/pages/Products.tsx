import { useState, useMemo } from "react";
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
      } else if (stockFilter === "lowStock") {
        result = result.filter((p) => p.stock >= 1 && p.stock <= 10);
      } else if (stockFilter === "goodStock") {
        result = result.filter((p) => p.stock > 10);
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

  // Stock summary
  const totalProducts = products.length;
  const stockBajo = products.filter((p) => p.stock >= 1 && p.stock <= 10).length;
  const agotados = products.filter((p) => p.stock === 0).length;
  const buenStock = products.filter((p) => p.stock > 10).length;

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

      {/* Stock Summary - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* First row: Total + Good Stock */}
        <button
          onClick={() => setStockFilter("all")}
          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
            stockFilter === "all"
              ? "bg-secondary ring-2 ring-foreground/20"
              : "bg-secondary/50 hover:bg-secondary"
          }`}
        >
          <span className="text-muted-foreground font-medium">Total</span>
          <span className="font-semibold">{totalProducts}</span>
        </button>
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

        {/* Second row: Low Stock + Out of Stock */}
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

              <Select value={stockFilter} onValueChange={handleStockChange}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el stock</SelectItem>
                  <SelectItem value="inStock">En stock</SelectItem>
                  <SelectItem value="outOfStock">Sin stock</SelectItem>
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
              Los campos vacíos no se modificarán
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={bulkEditData.category} onValueChange={(value) => setBulkEditData({ ...bulkEditData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin cambios" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
