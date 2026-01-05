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
    discount: 0,
    items: [] as OrderItem[],
  });
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        discount: order.discount,
        items: [...order.items],
      });
    } else {
      setFormData({
        status: "Pendiente",
        discount: 0,
        items: [],
      });
    }
  }, [order, open]);

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - formData.discount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast({ title: "Error", description: "Agrega al menos un producto al pedido.", variant: "destructive" });
      return;
    }

    if (isEditing && order) {
      const updatedOrder: Order = {
        ...order,
        status: formData.status,
        discount: formData.discount,
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
        discount: formData.discount,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? `Editar Pedido ${order.id}` : "Crear Nuevo Pedido"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

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
            <div className="flex items-center justify-between">
              <Label>Productos</Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-between">
                    <span className="text-muted-foreground">Agregar producto</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Buscar producto..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => addProduct(product.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Bs {product.price.toFixed(1)}
                              </span>
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
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Bs {item.price.toFixed(1)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateItemQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
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
                setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.00"
            />
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>Bs {calculateSubtotal().toFixed(1)}</span>
            </div>
            {formData.discount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Descuento:</span>
                <span>- Bs {formData.discount.toFixed(1)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total:</span>
              <span>Bs {calculateTotal().toFixed(1)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? "Guardar Cambios" : "Crear Pedido"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
