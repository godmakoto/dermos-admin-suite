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
import { X, Plus, Minus, ChevronDown, Search, MessageCircle } from "lucide-react";
import { Order, OrderItem } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderSaved?: (order: Order) => void;
}

export const OrderModal = ({ open, onClose, order, onOrderSaved }: OrderModalProps) => {
  const { products, orderStatuses, updateOrder, addOrder, orders } = useApp();
  const { toast } = useToast();
  
  const isEditing = !!order;

  const [formData, setFormData] = useState({
    status: "Pendiente",
    discount: "",
    items: [] as OrderItem[],
  });
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

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
    setJustSaved(false);
  }, [order, open]);

  const calculateSubtotal = () => {
    // Subtotal usando precios originales (sin descuentos)
    return formData.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      const originalPrice = product?.price || item.price;
      return sum + originalPrice * item.quantity;
    }, 0);
  };

  const calculateProductDiscounts = () => {
    // Suma de descuentos por productos con precio de oferta
    return formData.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.salePrice) {
        const discount = (product.price - product.salePrice) * item.quantity;
        return sum + discount;
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const productDiscounts = calculateProductDiscounts();
    const additionalDiscount = parseFloat(formData.discount) || 0;
    return subtotal - productDiscounts - additionalDiscount;
  };

  // Get available stock for a product considering current order context
  const getAvailableStock = (productId: string): number => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.trackStock) return Infinity;

    let available = product.stock;

    // If editing, add back the original quantity from the order (it was already deducted)
    if (isEditing && order) {
      const originalItem = order.items.find((item) => item.productId === productId);
      if (originalItem) {
        available += originalItem.quantity;
      }
    }

    return available;
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
      setJustSaved(true);
      if (onOrderSaved) {
        onOrderSaved(updatedOrder);
      }
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
      setJustSaved(true);
      if (onOrderSaved) {
        onOrderSaved(newOrder);
      }
    }
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    setJustSaved(false);
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          const availableStock = getAvailableStock(item.productId);

          // Don't allow going below 1
          if (newQuantity < 1) return item;

          // Don't allow exceeding available stock
          if (newQuantity > availableStock) {
            toast({
              title: "Stock insuficiente",
              description: `Solo hay ${availableStock} unidades disponibles de este producto.`,
              variant: "destructive",
            });
            return item;
          }

          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    }));
  };

  const removeItem = (itemId: string) => {
    setJustSaved(false);
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setJustSaved(false);
    const availableStock = getAvailableStock(productId);

    // Check if product has stock available
    if (product.trackStock && availableStock <= 0) {
      toast({
        title: "Sin stock disponible",
        description: `El producto "${product.name}" no tiene stock disponible.`,
        variant: "destructive",
      });
      setProductSearchOpen(false);
      return;
    }

    const existingItem = formData.items.find((item) => item.productId === productId);
    if (existingItem) {
      // Check if we can add one more
      if (existingItem.quantity >= availableStock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${availableStock} unidades disponibles de este producto.`,
          variant: "destructive",
        });
        setProductSearchOpen(false);
        return;
      }
      updateItemQuantity(existingItem.id, 1);
    } else {
      // Use sale price if available, otherwise use regular price
      const itemPrice = product.salePrice ?? product.price;

      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productImage: product.images && product.images.length > 0 ? product.images[0] : undefined,
        quantity: 1,
        price: itemPrice,
      };
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
    setProductSearchOpen(false);
  };

  const handleSendWhatsApp = () => {
    if (!order) return;

    // TODO: Implementar funcionalidad de WhatsApp
    toast({
      title: "Enviar por WhatsApp",
      description: "Funcionalidad en desarrollo",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="fixed inset-0 flex h-[100dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:h-[85vh] lg:w-[800px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl lg:border"
      >
        {/* Fixed Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6 lg:rounded-t-xl">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? `Editar Pedido ${order.id}` : "Crear Nuevo Pedido"}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-0 bg-green-600/90 text-white transition-colors hover:bg-green-600 focus:outline-none md:h-9 md:w-9"
                aria-label="Enviar por WhatsApp"
                title="Enviar pedido por WhatsApp"
              >
                <MessageCircle className="h-6 w-6 md:h-5 md:w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-0 bg-secondary/80 text-foreground transition-colors hover:bg-secondary focus:outline-none md:h-9 md:w-9 md:bg-muted/50 md:hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Scrollable Content Area */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-4 lg:px-6 space-y-6">

          {/* Status */}
          <div className="space-y-2">
            <Label>Estado del Pedido</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                setJustSaved(false);
                setFormData({ ...formData, status: value });
              }}
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
                        {products.map((product) => {
                          const availableStock = getAvailableStock(product.id);
                          const hasStockTracking = product.trackStock;
                          const outOfStock = hasStockTracking && availableStock <= 0;

                          return (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => addProduct(product.id)}
                              className="cursor-pointer"
                              disabled={outOfStock}
                            >
                              <div className="flex items-center gap-3 w-full">
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
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="truncate">{product.name}</span>
                                  <div className="flex items-center gap-2">
                                    {product.salePrice ? (
                                      <>
                                        <span className="text-xs text-muted-foreground line-through">
                                          Bs {product.price.toFixed(1)}
                                        </span>
                                        <span className="text-xs font-semibold text-foreground">
                                          Bs {product.salePrice.toFixed(1)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">
                                        Bs {product.price.toFixed(1)}
                                      </span>
                                    )}
                                    {hasStockTracking && (
                                      <span className={`text-xs ${outOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        • Stock: {availableStock}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              {formData.items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                const availableStock = getAvailableStock(item.productId);
                const hasStockTracking = product?.trackStock || false;
                const isAtMaxStock = hasStockTracking && item.quantity >= availableStock;

                return (
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
                      <div className="flex items-center gap-2">
                        {product && product.salePrice ? (
                          <>
                            <p className="text-xs text-muted-foreground line-through">
                              Bs {product.price.toFixed(1)}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              Bs {product.salePrice.toFixed(1)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Bs {item.price.toFixed(1)}
                          </p>
                        )}
                        {hasStockTracking && (
                          <p className="text-xs text-muted-foreground">
                            • Disp: {availableStock}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItemQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
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
                        disabled={isAtMaxStock}
                        title={isAtMaxStock ? "Stock máximo alcanzado" : ""}
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
                );
              })}
            </div>
          </div>

          {/* Discounts Section */}
          <div className="space-y-3">
            {/* Product Discounts (Read-only) */}
            {calculateProductDiscounts() > 0 && (
              <div className="space-y-2">
                <Label>Descuentos de productos</Label>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Suma de descuentos automáticos</span>
                    <span className="text-sm font-medium text-destructive">
                      - Bs {calculateProductDiscounts().toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Discount (Editable) */}
            <div className="space-y-2">
              <Label htmlFor="discount">Descuento adicional (Bs)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discount}
                onChange={(e) => {
                  setJustSaved(false);
                  setFormData({ ...formData, discount: e.target.value });
                }}
                placeholder="Ingrese descuento adicional"
              />
            </div>
          </div>

              {/* Totals */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>Bs {calculateSubtotal().toFixed(1)}</span>
                </div>
                {calculateProductDiscounts() > 0 && (
                  <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                    <span>Descuentos de productos:</span>
                    <span>- Bs {calculateProductDiscounts().toFixed(1)}</span>
                  </div>
                )}
                {(parseFloat(formData.discount) || 0) > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Descuento adicional:</span>
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
          <div className="shrink-0 border-t border-border bg-background px-4 py-4 lg:px-6 lg:rounded-b-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`w-full sm:w-auto transition-all duration-300 ${
                  justSaved
                    ? 'bg-foreground hover:bg-foreground text-background'
                    : 'bg-muted-foreground/50 hover:bg-muted-foreground/60 text-muted'
                }`}
              >
                {isEditing ? "Guardar Cambios" : "Crear Pedido"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
