import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { X, GripVertical, Link as LinkIcon } from "lucide-react";
import { Product } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const ProductModal = ({ open, onClose, product }: ProductModalProps) => {
  const { categories, subcategories, brands, labels, productCarouselStates, addProduct, updateProduct } = useApp();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    salePrice: "",
    category: "",
    subcategory: "",
    brand: "",
    label: "",
    carouselState: "",
    shortDescription: "",
    longDescription: "",
    usage: "",
    ingredients: "",
    images: [] as string[],
    trackStock: false,
    stock: "",
    status: "Activo" as "Activo" | "Inactivo" | "Agotado",
  });

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || "",
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        label: product.label,
        carouselState: product.carouselState,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        usage: product.usage,
        ingredients: product.ingredients,
        images: [...product.images],
        trackStock: product.trackStock,
        stock: product.stock.toString(),
        status: product.status,
      });
    } else {
      setFormData({
        name: "",
        price: "",
        salePrice: "",
        category: "",
        subcategory: "",
        brand: "",
        label: "",
        carouselState: "",
        shortDescription: "",
        longDescription: "",
        usage: "",
        ingredients: "",
        images: [],
        trackStock: false,
        stock: "",
        status: "Activo",
      });
    }
    setActiveTab("general");
  }, [product, open]);

  const filteredSubcategories = subcategories.filter(
    (sub) => {
      const category = categories.find((c) => c.name === formData.category);
      return category && sub.categoryId === category.id;
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Product = {
      id: product?.id || `${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      category: formData.category,
      subcategory: formData.subcategory,
      brand: formData.brand,
      label: formData.label,
      carouselState: formData.carouselState,
      shortDescription: formData.shortDescription,
      longDescription: formData.longDescription,
      usage: formData.usage,
      ingredients: formData.ingredients,
      images: formData.images,
      trackStock: formData.trackStock,
      stock: parseInt(formData.stock) || 0,
      status: formData.status,
      createdAt: product?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (product) {
      updateProduct(productData);
      toast({ title: "Producto actualizado", description: "Los cambios se han guardado correctamente." });
    } else {
      addProduct(productData);
      toast({ title: "Producto creado", description: "El producto se ha añadido correctamente." });
    }

    onClose();
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (from: number, to: number) => {
    setFormData((prev) => {
      const images = [...prev.images];
      const [removed] = images.splice(from, 1);
      images.splice(to, 0, removed);
      return { ...prev, images };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="fixed !inset-0 flex h-[100dvh] !w-full !max-w-full !translate-x-0 !translate-y-0 flex-col gap-0 !rounded-none !border-0 !p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[95vh] md:max-w-3xl md:-translate-x-1/2 md:-translate-y-1/2 md:!rounded-xl md:border"
      >
        {/* Fixed Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6 md:rounded-t-xl">
          <DialogTitle className="text-lg font-semibold">
            {product ? "Editar Producto" : "Nuevo Producto"}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
            {/* Fixed Tabs Bar */}
            <div className="shrink-0 border-b border-border bg-background px-4 md:px-6">
              <TabsList className="grid h-12 w-full grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="general" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none">
                  General
                </TabsTrigger>
                <TabsTrigger value="details" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none">
                  Detalles
                </TabsTrigger>
                <TabsTrigger value="images" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none">
                  Imágenes
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content Area */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-4 py-4 md:px-6">
                <TabsContent value="general" className="m-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salePrice">Precio de oferta</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        placeholder="Dejar vacío si no hay oferta"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategoría</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                        disabled={!formData.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.name}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) => setFormData({ ...formData, brand: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Propiedad</Label>
                      <Select
                        value={formData.label}
                        onValueChange={(value) => setFormData({ ...formData, label: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar propiedad" />
                        </SelectTrigger>
                        <SelectContent>
                          {labels.map((label) => (
                            <SelectItem key={label.id} value={label.name}>
                              {label.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Estado de Carrusel</Label>
                      <Select
                        value={formData.carouselState}
                        onValueChange={(value) => setFormData({ ...formData, carouselState: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado de carrusel" />
                        </SelectTrigger>
                        <SelectContent>
                          {productCarouselStates.map((state) => (
                            <SelectItem key={state.id} value={state.name}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: state.color }}
                                />
                                <span>{state.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "Activo" | "Inactivo" | "Agotado") => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                          <SelectItem value="Agotado">Agotado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="trackStock"
                      checked={formData.trackStock}
                      onCheckedChange={(checked) => setFormData({ ...formData, trackStock: checked === true })}
                    />
                    <Label htmlFor="trackStock" className="cursor-pointer">
                      Controlar stock de este producto
                    </Label>
                  </div>

                  {formData.trackStock && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Descripción corta</Label>
                    <Input
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Breve descripción del producto"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="m-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Descripción larga</Label>
                    <Textarea
                      id="longDescription"
                      value={formData.longDescription}
                      onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                      placeholder="Descripción detallada del producto"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usage">Modo de uso</Label>
                    <Textarea
                      id="usage"
                      value={formData.usage}
                      onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                      placeholder="Instrucciones de uso"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ingredients">Ingredientes</Label>
                    <Textarea
                      id="ingredients"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      placeholder="Lista de ingredientes"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="images" className="m-0 space-y-4">
                  {/* Add image by URL */}
                  <div className="space-y-2">
                    <Label>Agregar imagen por URL</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full"
                      />
                      <Button type="button" onClick={addImageUrl} variant="secondary" className="w-full shrink-0 sm:w-auto">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  {/* Image list */}
                  <div className="space-y-2">
                    <Label>Imágenes ({formData.images.length})</Label>
                    <div className="space-y-3">
                      {formData.images.length === 0 ? (
                        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                          <p className="text-sm text-muted-foreground">No hay imágenes agregadas</p>
                        </div>
                      ) : (
                        formData.images.map((img, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3"
                          >
                            <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground" />
                            <img
                              src={img}
                              alt={`Imagen ${index + 1}`}
                              className="h-14 w-14 shrink-0 rounded-md object-cover"
                            />
                            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{img}</span>
                            <div className="flex items-center gap-1 shrink-0 ml-auto">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveImage(index, index - 1)}
                                  className="h-9 w-9 p-0"
                                >
                                  ↑
                                </Button>
                              )}
                              {index < formData.images.length - 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveImage(index, index + 1)}
                                  className="h-9 w-9 p-0"
                                >
                                  ↓
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="h-9 w-9 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>

          {/* Fixed Footer */}
          <div className="shrink-0 border-t border-border bg-background px-4 py-4 md:px-6 md:rounded-b-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {product ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};