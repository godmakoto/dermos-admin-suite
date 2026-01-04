import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProductModal } from "@/components/products/ProductModal";
import { useApp } from "@/contexts/AppContext";
import { Product } from "@/types";
import { Plus, Copy, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const { products, labels, duplicateProduct, deleteProduct } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getLabelColor = (labelName: string) => {
    const label = labels.find((l) => l.name === labelName);
    return label?.color || "#6b7280";
  };

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
      <PageHeader title="Productos" description="Gestiona tu catálogo de productos">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={products}
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
