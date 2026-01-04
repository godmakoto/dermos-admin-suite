import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProductModal } from "@/components/products/ProductModal";
import { useApp } from "@/contexts/AppContext";
import { Product } from "@/types";
import { Plus, Copy, Trash2, MoreHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const { products, labels, categories, brands, duplicateProduct, deleteProduct } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  const getLabelColor = (labelName: string) => {
    const label = labels.find((l) => l.name === labelName);
    return label?.color || "#6b7280";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "#22c55e";
      case "Inactivo":
        return "#6b7280";
      case "Agotado":
        return "#ef4444";
      default:
        return "#6b7280";
    }
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

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateProduct(id);
    toast({ title: "Producto duplicado", description: "Se ha creado una copia del producto." });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProduct(id);
    toast({ title: "Producto eliminado", description: "El producto se ha eliminado correctamente." });
  };

  const columns = [
    {
      key: "image",
      label: "",
      className: "w-14",
      render: (product: Product) =>
        product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-muted" />
        ),
    },
    {
      key: "name",
      label: "Producto",
      render: (product: Product) => (
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Categoría",
      render: (product: Product) => (
        <div>
          <p className="text-sm">{product.category}</p>
          <p className="text-xs text-muted-foreground">{product.subcategory}</p>
        </div>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (product: Product) => (
        <span className="font-medium">Bs {product.price.toFixed(1)}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (product: Product) => (
        <span className={`text-sm ${product.stock === 0 ? "text-destructive" : ""}`}>
          {product.stock}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (product: Product) => (
        <StatusBadge label={product.status} color={getStatusColor(product.status)} />
      ),
    },
    {
      key: "label",
      label: "Etiqueta",
      render: (product: Product) =>
        product.label ? (
          <StatusBadge label={product.label} color={getLabelColor(product.label)} />
        ) : null,
    },
    {
      key: "actions",
      label: "",
      className: "w-12",
      render: (product: Product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleDuplicate(product.id, e)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleDelete(product.id, e)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, marca o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Todo el stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el stock</SelectItem>
              <SelectItem value="inStock">En stock</SelectItem>
              <SelectItem value="outOfStock">Sin stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[150px]">
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

      <DataTable
        columns={columns}
        data={filteredProducts}
        onRowClick={handleEdit}
        emptyMessage="No hay productos. Crea tu primer producto para comenzar."
      />

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </MainLayout>
  );
};

export default Products;
