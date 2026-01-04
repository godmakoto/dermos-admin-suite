import { Product } from "@/types";
import { Copy, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
}

const getStockLevel = (stock: number) => {
  if (stock === 0) return { label: "Agotado", color: "border-destructive text-destructive" };
  if (stock <= 10) return { label: "Bajo", color: "border-destructive text-destructive" };
  if (stock <= 30) return { label: "Medio", color: "border-yellow-500 text-yellow-600" };
  return { label: "Alto", color: "border-green-500 text-green-600" };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Activo":
      return "text-green-500";
    case "Inactivo":
      return "text-muted-foreground";
    case "Agotado":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
};

export const ProductCard = ({ product, onClick, onDelete, onDuplicate }: ProductCardProps) => {
  const stockLevel = getStockLevel(product.stock);

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
    >
      {/* Image */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            Sin img
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-foreground truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.brand}</p>
        
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs font-normal">
            {product.category}
          </Badge>
          {product.label && (
            <Badge variant="outline" className="text-xs font-normal">
              {product.label}
            </Badge>
          )}
        </div>

        <p className="mt-2 text-lg font-semibold text-foreground">
          {product.price.toFixed(1)} Bs
        </p>
      </div>

      {/* Stock Badge & Actions */}
      <div className="ml-auto flex items-center gap-2">
        <Badge
          variant="outline"
          className={`rounded-full border-2 px-3 py-1 text-sm font-medium ${stockLevel.color}`}
        >
          {product.stock} • {stockLevel.label}
        </Badge>
        
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDuplicate}
          >
            <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
};
