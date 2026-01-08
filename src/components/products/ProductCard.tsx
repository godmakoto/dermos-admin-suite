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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRef, useState, useEffect, useCallback } from "react";

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
  if (stock === 0) return { label: "Agotado", color: "bg-muted text-muted-foreground border-border" };
  if (stock <= 10) return { label: "Bajo", color: "bg-destructive/10 text-destructive border-destructive/20" };
  if (stock <= 30) return { label: "Medio", color: "bg-warning/15 text-warning border-warning/30" };
  return { label: "Alto", color: "bg-success/10 text-success border-success/20" };
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const pendingDeleteEvent = useRef<React.MouseEvent | null>(null);
  const touchStartY = useRef<number>(0);
  const touchMoved = useRef<boolean>(false);

  // Close menu on scroll (works on both touch and mouse scroll)
  const handleScroll = useCallback(() => {
    if (menuOpen) {
      setMenuOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    
    // Listen to scroll on window and all scrollable containers
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    
    // Also listen to touchmove for touch devices
    window.addEventListener('touchmove', handleScroll, { capture: true, passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('touchmove', handleScroll, { capture: true });
    };
  }, [menuOpen, handleScroll]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    pendingDeleteEvent.current = e;
    setMenuOpen(false);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteEvent.current) {
      onDelete(pendingDeleteEvent.current);
      pendingDeleteEvent.current = null;
    }
    setDeleteDialogOpen(false);
  };

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
      className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border transition-all hover:shadow-md active:scale-[0.995] duration-200 p-3 lg:gap-4 lg:p-4 md:min-h-[120px] ${
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
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted border border-border lg:h-20 lg:w-20">
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
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  if (touchMoved.current) {
                    e.preventDefault();
                    touchMoved.current = false;
                    return;
                  }
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  touchStartY.current = e.touches[0].clientY;
                  touchMoved.current = false;
                }}
                onTouchMove={(e) => {
                  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
                  if (deltaY > 10) {
                    touchMoved.current = true;
                  }
                }}
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
                onClick={handleDeleteClick} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará el producto "{product.name}" de forma permanente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Chips - Categorías y subcategorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {visibleChips.map((chip, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex-shrink-0 rounded-full bg-secondary text-muted-foreground border-border text-xs font-normal px-2 py-0.5 whitespace-nowrap"
            >
              {chip}
            </Badge>
          ))}
          {extraChipsCount > 0 && (
            <Badge
              variant="outline"
              className="flex-shrink-0 rounded-full bg-muted text-muted-foreground border-border text-xs font-normal px-2 py-0.5"
            >
              +{extraChipsCount}
            </Badge>
          )}
        </div>

        {/* Footer: Precio + Stock */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1 md:pt-2">
          <p className="text-sm font-semibold text-foreground">
            {product.price.toFixed(1)} Bs
          </p>
          <Badge
            variant="outline"
            className={`flex-shrink-0 rounded-lg text-xs border px-2.5 py-1 font-normal whitespace-nowrap ${stockLevel.color}`}
          >
            {product.stock} • {stockLevel.label}
          </Badge>
        </div>
      </div>
    </div>
  );
};
