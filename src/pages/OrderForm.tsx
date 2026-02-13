import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { X, Plus, Minus, ChevronDown, Search, MessageCircle } from "lucide-react";
import { Order, OrderItem } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const OrderForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, orderStatuses, updateOrder, addOrder, orders } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const order = id ? orders.find((o) => o.id === id) : null;
  const isEditing = !!order;

  const [formData, setFormData] = useState({
    status: "Pendiente",
    discount: "",
    items: [] as OrderItem[],
  });
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        discount: order.discount > 0 ? order.discount.toString() : "",
        items: [...order.items],
      });
    }
  }, [order]);



  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      const originalPrice = product?.price || item.price;
      return sum + originalPrice * item.quantity;
    }, 0);
  };

  const calculateProductDiscounts = () => {
    return formData.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
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

  // Un estado "retiene stock" si NO es Cancelado
  const statusHoldsStock = (statusName: string): boolean => statusName !== "Cancelado";

  // Get available stock for a product considering current order context
  const getAvailableStock = (productId: string): number => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.trackStock) return Infinity;

    let available = product.stock;

    // Si estamos editando y el estado actual del pedido retiene stock,
    // sumar la cantidad original (ya fue descontada del stock del producto)
    if (isEditing && order && statusHoldsStock(order.status)) {
      const originalItem = order.items.find((item) => item.product_id === productId);
      if (originalItem) {
        available += originalItem.quantity;
      }
    }

    return available;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast({ title: "Error", description: "Agrega al menos un producto al pedido.", variant: "destructive" });
      return;
    }

    const discountValue = parseFloat(formData.discount) || 0;

    const statusObj = orderStatuses.find((s) => s.name === formData.status);
    if (!statusObj) {
      toast({ title: "Error", description: "Estado de pedido invalido.", variant: "destructive" });
      return;
    }

    try {
      if (isEditing && order) {
        const updatedOrder: Order = {
          ...order,
          status: formData.status,
          status_id: statusObj.id,
          discount: discountValue,
          product_discounts: calculateProductDiscounts(),
          items: formData.items,
          subtotal: calculateSubtotal(),
          total: calculateTotal(),
          updatedAt: new Date(),
        };
        await updateOrder(updatedOrder);
        toast({ title: "Pedido actualizado", description: "El pedido se ha actualizado correctamente." });
      } else {
        let nextOrderNumber = 1000;
        if (orders.length > 0) {
          const orderNumbers = orders
            .map(o => {
              const match = o.order_number.match(/ORD-(\d+)/);
              return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);

          if (orderNumbers.length > 0) {
            nextOrderNumber = Math.max(...orderNumbers) + 1;
          }
        }
        const orderNumber = `ORD-${nextOrderNumber}`;

        const newOrder: Order = {
          id: `${Date.now()}`,
          order_number: orderNumber,
          customer_name: "Cliente Administrador",
          customer_phone: "N/A",
          customer_email: null,
          customer_address: null,
          status: formData.status,
          status_id: statusObj.id,
          discount: discountValue,
          product_discounts: calculateProductDiscounts(),
          items: formData.items,
          subtotal: calculateSubtotal(),
          total: calculateTotal(),
          notes: null,
          payment_method: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await addOrder(newOrder);
        toast({ title: "Pedido creado", description: "El pedido se ha creado correctamente." });
      }
      navigate("/orders");
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el pedido. Intente nuevamente.",
        variant: "destructive"
      });
    }
  };

  const updateItemQuantity = (productId: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + delta;
          const availableStock = getAvailableStock(item.product_id);

          if (newQuantity < 1) return item;

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

  const removeItem = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.product_id !== productId),
    }));
  };

  const addProductToOrder = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const availableStock = getAvailableStock(productId);

    if (product.trackStock && availableStock <= 0) {
      toast({
        title: "Sin stock disponible",
        description: `El producto "${product.name}" no tiene stock disponible.`,
        variant: "destructive",
      });
      setProductSearchOpen(false);
      return;
    }

    const existingItem = formData.items.find((item) => item.product_id === productId);
    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${availableStock} unidades disponibles de este producto.`,
          variant: "destructive",
        });
        setProductSearchOpen(false);
        return;
      }
      updateItemQuantity(existingItem.product_id, 1);
    } else {
      const itemPrice = product.salePrice ?? product.price;
      const newItem: OrderItem = {
        product_id: product.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        quantity: 1,
        price: itemPrice,
        subtotal: itemPrice,
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
    toast({
      title: "Enviar por WhatsApp",
      description: "Funcionalidad en desarrollo",
    });
  };

  const goBack = () => navigate("/orders");

  return (
    <AppLayout>
      <PageHeader
        title={isEditing ? `Editar Pedido ${order?.order_number}` : "Crear Nuevo Pedido"}
        description={isEditing ? "Modifica los datos del pedido" : "Agrega productos y crea un nuevo pedido"}
      >
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-600/90 text-white transition-colors hover:bg-green-600"
              aria-label="Enviar por WhatsApp"
              title="Enviar pedido por WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </PageHeader>

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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Label>Productos</Label>

            {/* Desktop: Popover */}
            {!isMobile && (
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full md:w-64 justify-between">
                    <span className="text-muted-foreground">Agregar producto</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-96 p-0 z-[200]"
                  align="end"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar producto..."
                      autoComplete="chrome-off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      data-form-type="other"
                    />
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
                              onSelect={() => addProductToOrder(product.id)}
                              className="cursor-pointer"
                              disabled={outOfStock}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                  {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">Sin img</div>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="truncate">{product.name}</span>
                                  <div className="flex items-center gap-2">
                                    {product.salePrice ? (
                                      <>
                                        <span className="text-xs text-muted-foreground line-through">Bs {product.price.toFixed(1)}</span>
                                        <span className="text-xs font-semibold text-foreground">Bs {product.salePrice.toFixed(1)}</span>
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">Bs {product.price.toFixed(1)}</span>
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
            )}

            {/* Mobile: Button + Dialog */}
            {isMobile && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    setMobileSearchQuery("");
                    setProductSearchOpen(true);
                  }}
                >
                  <span className="text-muted-foreground">Agregar producto</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Dialog open={productSearchOpen} onOpenChange={(open) => {
                  if (!open) setMobileSearchQuery("");
                  setProductSearchOpen(open);
                }}>
                  <DialogContent
                    className="!fixed !inset-0 !flex !flex-col !translate-x-0 !translate-y-0 !max-w-none !w-full !h-full !rounded-none !border-0 !p-0 !gap-0 !shadow-none overflow-hidden overscroll-contain data-[state=open]:!zoom-in-100 data-[state=open]:!slide-in-from-bottom-0"
                    overlayClassName="bg-black/80"
                    hideCloseButton
                  >
                    <div className="flex flex-col h-full bg-background">
                      {/* Fixed Header with Search */}
                      <div className="flex-shrink-0 sticky top-0 z-20 bg-background border-b">
                        <div className="flex items-center gap-3 px-4 py-4">
                          <div className="flex-1 relative">
                            <div className="flex items-center h-12 w-full rounded-lg bg-background border border-border px-3 gap-3">
                              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={mobileSearchQuery}
                                onChange={(e) => setMobileSearchQuery(e.target.value)}
                                autoFocus
                                autoComplete="chrome-off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                data-form-type="other"
                                className="flex-1 h-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProductSearchOpen(false)}
                            className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent transition-colors"
                            aria-label="Cerrar"
                          >
                            <X className="h-5 w-5 text-foreground" />
                          </button>
                        </div>
                      </div>

                      {/* Scrollable Product List */}
                      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                        {(() => {
                          const filteredProducts = products.filter((product) =>
                            product.name.toLowerCase().includes(mobileSearchQuery.toLowerCase())
                          );

                          if (filteredProducts.length === 0) {
                            return (
                              <div className="py-12 text-center text-muted-foreground">
                                No se encontraron productos.
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-2.5">
                              {filteredProducts.map((product) => {
                                const availableStock = getAvailableStock(product.id);
                                const hasStockTracking = product.trackStock;
                                const outOfStock = hasStockTracking && availableStock <= 0;

                                return (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => !outOfStock && addProductToOrder(product.id)}
                                    disabled={outOfStock}
                                    className={`w-full flex items-center gap-3 p-3.5 rounded-lg border transition-colors text-left ${
                                      outOfStock
                                        ? 'opacity-50 cursor-not-allowed bg-muted/30'
                                        : 'bg-card hover:bg-accent active:bg-accent border-border'
                                    }`}
                                  >
                                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                                      {product.images && product.images.length > 0 ? (
                                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">Sin img</div>
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="truncate font-medium text-base">{product.name}</span>
                                      <div className="flex items-center gap-2 mt-1">
                                        {product.salePrice ? (
                                          <>
                                            <span className="text-sm text-muted-foreground line-through">Bs {product.price.toFixed(1)}</span>
                                            <span className="text-sm font-semibold text-foreground">Bs {product.salePrice.toFixed(1)}</span>
                                          </>
                                        ) : (
                                          <span className="text-sm text-muted-foreground">Bs {product.price.toFixed(1)}</span>
                                        )}
                                        {hasStockTracking && (
                                          <span className={`text-sm ${outOfStock ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                            • Stock: {availableStock}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>

          <div className="space-y-2">
            {formData.items.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              const availableStock = getAvailableStock(item.product_id);
              const hasStockTracking = product?.trackStock || false;
              const isAtMaxStock = hasStockTracking && item.quantity >= availableStock;

              return (
                <div
                  key={item.product_id}
                  className="flex items-center gap-2 rounded-lg border border-border p-2"
                >
                  {item.image && (
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      {product && product.salePrice ? (
                        <>
                          <p className="text-xs text-muted-foreground line-through">Bs {product.price.toFixed(1)}</p>
                          <p className="text-sm font-semibold text-foreground">Bs {product.salePrice.toFixed(1)}</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Bs {item.price.toFixed(1)}</p>
                      )}
                      {hasStockTracking && (
                        <p className="text-xs text-muted-foreground">• Disp: {availableStock}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItemQuantity(item.product_id, -1)} disabled={item.quantity <= 1}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItemQuantity(item.product_id, 1)} disabled={isAtMaxStock} title={isAtMaxStock ? "Stock maximo alcanzado" : ""}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.product_id)}>
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
          {calculateProductDiscounts() > 0 && (
            <div className="space-y-2">
              <Label>Descuentos de productos</Label>
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Suma de descuentos automaticos</span>
                  <span className="text-sm font-medium text-destructive">
                    - Bs {calculateProductDiscounts().toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="discount">Descuento adicional (Bs)</Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              min="0"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
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

        {/* Footer Actions */}
        <div className="sticky bottom-0 -mx-4 lg:-mx-6 border-t border-border bg-background px-4 py-4 lg:px-6">
          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              {isEditing ? "Guardar Cambios" : "Crear Pedido"}
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default OrderForm;
