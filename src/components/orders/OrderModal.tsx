import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, Plus, Minus, ChevronDown, Search } from "lucide-react";
import { Order, OrderItem } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderModal = ({ open, onClose, order }: OrderModalProps) => {
  const { products, orderStatuses, updateOrder, addOrder, orders } = useApp();
  const { toast } = useToast();
  
  const isEditing = !!order;
  
  const [formData, setFormData] = useState({
    status: "Pendiente",
    discount: "",
    items: [] as OrderItem[],
  });
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        discount: order.discount > 0 ? order.discount.toString() : "",
        items: [...order.items],
      });
    } else {
      setFormData({
        status: "Pendiente",
        discount: "",
        items: [],
      });
    }
  }, [order, open]);

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const discountValue = parseFloat(formData.discount) || 0;
    return calculateSubtotal() - discountValue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast({ title: "Error", description: "Agrega al menos un producto al pedido.", variant: "destructive" });
      return;
    }

    const discountValue = parseFloat(formData.discount) || 0;

    if (isEditing && order) {
      const updatedOrder: Order = {
        ...order,
        status: formData.status,
        discount: discountValue,
        items: formData.items,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        updatedAt: new Date(),
      };
      updateOrder(updatedOrder);
      toast({ title: "Pedido actualizado", description: "Los cambios se han guardado correctamente." });
    } else {
      // Generate new order ID
      const lastOrderId = orders.length > 0
        ? Math.max(...orders.map(o => parseInt(o.id.replace('#', '')) || 0))
        : 999;
      const newOrderId = `#${lastOrderId + 1}`;

      const newOrder: Order = {
        id: newOrderId,
        customerName: "",
        customerEmail: "",
        status: formData.status,
        discount: discountValue,
        items: formData.items,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addOrder(newOrder);
      toast({ title: "Pedido creado", description: `El pedido ${newOrderId} se ha creado correctamente.` });
    }
    onClose();
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      ),
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = formData.items.find((item) => item.productId === productId);
    if (existingItem) {
      updateItemQuantity(existingItem.id, 1);
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productImage: product.images && product.images.length > 0 ? product.images[0] : undefined,
        quantity: 1,
        price: product.price,
      };
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
    setProductSearchOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="fixed !inset-0 flex h-[100dvh] !w-full !max-w-full !translate-x-0 !translate-y-0 flex-col gap-0 !rounded-none !border-0 !p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[95vh] md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:!rounded-xl md:border"
      >
        {/* Fixed Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6 md:rounded-t-xl">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? `Editar Pedido ${order.id}` : "Crear Nuevo Pedido"}
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-0 bg-secondary/80 text-foreground transition-colors hover:bg-secondary focus:outline-none md:h-9 md:w-9 md:bg-muted/50 md:hover:bg-muted"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6 md:h-5 md:w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Scrollable Content Area */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-4 md:px-6 space-y-6">

          {/* Status */}
          <div className="space-y-2">
            <Label>Estado del Pedido</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.name}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Label>Productos</Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-64 justify-between">
                    <span className="text-muted-foreground">Agregar producto</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-2rem)] md:w-96 p-0 z-[200]"
                  align="end"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <Command>
                    <CommandInput placeholder="Buscar producto..." />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => addProduct(product.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                    Sin img
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{product.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Bs {product.price.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              {formData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-border p-2"
                >
                  {/* Product Image */}
                  {item.productImage && (
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Bs {item.price.toFixed(1)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateItemQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateItemQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discount">Descuento (Bs)</Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              min="0"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
              placeholder="Ingrese descuento"
            />
          </div>

              {/* Totals */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>Bs {calculateSubtotal().toFixed(1)}</span>
                </div>
                {(parseFloat(formData.discount) || 0) > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Descuento:</span>
                    <span>- Bs {(parseFloat(formData.discount) || 0).toFixed(1)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <span>Total:</span>
                  <span>Bs {calculateTotal().toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="shrink-0 border-t border-border bg-background px-4 py-4 md:px-6 md:rounded-b-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {isEditing ? "Guardar Cambios" : "Crear Pedido"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
