import { Product } from "@/types";
import { Copy, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRef } from "react";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onLongPress?: () => void;
  isSelectionMode?: boolean;
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

export const ProductCard = ({
  product,
  onClick,
  onDelete,
  onDuplicate,
  isSelected = false,
  onSelect,
  onLongPress,
  isSelectionMode = false
}: ProductCardProps) => {
  const stockLevel = getStockLevel(product.stock);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const handleCardClick = () => {
    // Si fue long press, no hacer nada
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }

    if (isSelectionMode && onSelect) {
      onSelect(!isSelected);
    } else {
      onClick();
    }
  };

  const handlePressStart = () => {
    isLongPress.current = false;
    if (!isSelectionMode && onLongPress) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
        // Vibración opcional en dispositivos móviles
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 1000);
    }
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(checked);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border transition-all hover:shadow-lg active:scale-[0.99] duration-200 md:items-center md:gap-4 ${
        isSelected
          ? 'border-primary bg-primary/5 p-3 md:p-4'
          : 'border-border bg-card p-3 md:p-4'
      }`}
    >
      {/* Checkbox - Visible en modo selección */}
      {isSelectionMode && onSelect && (
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-5 w-5"
          />
        </div>
      )}

      {/* Image - Perfect Square */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted border border-border md:h-16 md:w-16">
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
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Top: Nombre y Marca */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground truncate leading-tight mb-0.5">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {product.brand}
            </p>
          </div>
        </div>

        {/* Badges - Horizontal scroll */}
        <div className="mb-2 flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          <Badge
            variant="outline"
            className="flex-shrink-0 rounded-md bg-primary/10 text-primary border-primary/20 text-xs font-normal px-2.5 py-0.5"
          >
            {product.category}
          </Badge>
          {product.subcategory && (
            <Badge
              variant="outline"
              className="flex-shrink-0 rounded-md bg-primary/10 text-primary border-primary/20 text-xs font-normal px-2.5 py-0.5"
            >
              {product.subcategory}
            </Badge>
          )}
        </div>

        {/* Bottom: Price and Stock */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <p className="text-foreground font-medium">
            {product.price.toFixed(1)} Bs
          </p>

          <Badge
            variant="outline"
            className={`flex-shrink-0 rounded-lg text-xs border whitespace-nowrap px-2.5 py-1 md:hidden ${stockLevel.color}`}
          >
            {product.stock} • {stockLevel.label}
          </Badge>
        </div>
      </div>

      {/* Delete button - Posición absoluta en móvil */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 flex-shrink-0 md:hidden touch-manipulation"
        onClick={onDelete}
      >
        <Trash2 className="h-5 w-5 text-destructive" />
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
