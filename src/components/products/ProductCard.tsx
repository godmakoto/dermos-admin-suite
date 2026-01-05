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
      className="group relative flex cursor-pointer items-start gap-5 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md md:items-center md:gap-6 md:p-4"
    >
      {/* Image - Más grande en móvil */}
      <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted md:h-16 md:w-16">
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

      {/* Info - Mobile layout espaciado */}
      <div className="min-w-0 flex-1 pr-10 md:pr-0">
        {/* Nombre y Marca */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.brand}
          </p>
        </div>

        {/* Badges - Espaciados verticalmente en móvil */}
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:flex-wrap">
          <Badge
            variant="secondary"
            className="w-fit rounded-full bg-muted/80 text-foreground border-0 text-sm font-normal px-4 py-1.5"
          >
            {product.category}
          </Badge>
          {product.label && (
            <Badge
              variant="secondary"
              className="w-fit rounded-full bg-foreground text-background border-0 text-sm font-medium px-4 py-1.5"
            >
              {product.label}
            </Badge>
          )}
        </div>

        {/* Price and Stock - Espaciados */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-bold text-foreground">
            {product.price.toFixed(1)} Bs
          </p>

          <Badge
            variant="outline"
            className={`rounded-full bg-background px-4 py-2 text-sm font-medium ${stockLevel.color} md:hidden`}
          >
            {product.stock} • {stockLevel.label}
          </Badge>
        </div>
      </div>

      {/* Delete button - Posición absoluta en móvil */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-9 w-9 flex-shrink-0 md:hidden"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

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
