import { Product } from "@/types";
import { Copy, Trash2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  if (stock === 0) return { label: "Agotado", color: "border-destructive text-destructive bg-destructive/5" };
  if (stock <= 10) return { label: "Bajo", color: "border-destructive text-destructive bg-destructive/5" };
  if (stock <= 30) return { label: "Medio", color: "border-yellow-500 text-yellow-600 bg-yellow-500/5" };
  return { label: "Alto", color: "border-green-500 text-green-600 bg-green-500/5" };
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

  // Chips: max 2 visible
  const allChips = [product.category, product.subcategory].filter(Boolean);
  const visibleChips = allChips.slice(0, 2);
  const extraChipsCount = allChips.length - 2;

  const handleCardClick = () => {
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
      className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border transition-all hover:shadow-md active:scale-[0.995] duration-200 p-3 md:p-4 md:min-h-[120px] ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card'
      }`}
    >
      {/* Checkbox - Visible en modo selección */}
      {isSelectionMode && onSelect && (
        <div className="flex-shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-5 w-5"
          />
        </div>
      )}

      {/* Image */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted border border-border md:h-[72px] md:w-[72px]">
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

      {/* Content */}
      <div className="min-w-0 flex-1 flex flex-col gap-1 md:gap-2">
        {/* Header: Nombre + Marca */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-foreground truncate leading-tight">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground/70 truncate">
              {product.brand}
            </p>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onDuplicate} className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chips - Secondary, compact */}
        <div className="flex items-center gap-1 overflow-hidden md:mt-1">
          {visibleChips.map((chip, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex-shrink-0 rounded-md bg-muted/50 text-muted-foreground border-transparent text-[10px] font-normal px-1.5 py-0 h-[18px]"
            >
              {chip}
            </Badge>
          ))}
          {extraChipsCount > 0 && (
            <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
              +{extraChipsCount}
            </span>
          )}
        </div>

        {/* Footer: Precio + Stock */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1 md:pt-2">
          <p className="text-sm font-semibold text-foreground">
            {product.price.toFixed(1)} Bs
          </p>
          <Badge
            variant="outline"
            className={`flex-shrink-0 rounded-md text-[10px] border px-1.5 py-0 h-[18px] font-medium ${stockLevel.color}`}
          >
            {product.stock} • {stockLevel.label}
          </Badge>
        </div>
      </div>
    </div>
  );
};
