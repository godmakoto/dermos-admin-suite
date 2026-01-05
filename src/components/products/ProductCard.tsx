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
      className="group flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md md:items-center"
    >
      {/* Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted md:h-16 md:w-16">
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

      {/* Info - Mobile layout más espaciado */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground leading-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{product.brand}</p>
          </div>
          
          {/* Delete button - visible siempre en móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 md:hidden"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        
        {/* Badges */}
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs font-normal px-2.5 py-1">
            {product.category}
          </Badge>
          {product.label && (
            <Badge variant="outline" className="text-xs font-normal px-2.5 py-1">
              {product.label}
            </Badge>
          )}
        </div>

        {/* Price and Stock - En móvil en la misma línea */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-foreground">
            {product.price.toFixed(1)} Bs
          </p>
          
          <Badge
            variant="outline"
            className={`rounded-full border-2 px-3 py-1 text-sm font-medium ${stockLevel.color} md:hidden`}
          >
            {product.stock} • {stockLevel.label}
          </Badge>
        </div>
      </div>

      {/* Desktop: Stock Badge & Actions */}
      <div className="ml-auto hidden flex-col items-end gap-2 md:flex">
        <div className="flex items-center gap-1">
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
        
        <Badge
          variant="outline"
          className={`rounded-full border-2 px-3 py-1 text-sm font-medium ${stockLevel.color}`}
        >
          {product.stock} • {stockLevel.label}
        </Badge>
      </div>
    </div>
  );
};
