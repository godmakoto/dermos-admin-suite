import { useState, useEffect, useRef } from "react";
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
import { X, GripVertical, Link as LinkIcon, Upload, Loader2, Copy, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/supabase";
import { ImageCropEditor } from "@/components/ImageCropEditor";
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

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const ProductModal = ({ open, onClose, product }: ProductModalProps) => {
  const { categories, subcategories, brands, labels, productCarouselStates, addProduct, updateProduct, duplicateProduct, deleteProduct } = useApp();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    salePrice: "",
    categories: [] as string[],
    subcategories: [] as string[],
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || "",
        categories: [...product.categories],
        subcategories: [...product.subcategories],
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
        categories: [],
        subcategories: [],
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

  // Filter subcategories based on selected categories
  const filteredSubcategories = subcategories.filter((sub) => {
    // Get all selected category IDs
    const selectedCategoryIds = formData.categories
      .map((catName) => categories.find((c) => c.name === catName)?.id)
      .filter(Boolean);

    // Include subcategory if it belongs to any selected category
    return selectedCategoryIds.includes(sub.categoryId);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Campo obligatorio",
        description: "El nombre del producto es obligatorio.",
        variant: "destructive",
      });
      setActiveTab("general");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Campo obligatorio",
        description: "El precio del producto es obligatorio y debe ser mayor a 0.",
        variant: "destructive",
      });
      setActiveTab("general");
      return;
    }

    const productData: Product = {
      id: product?.id || `${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      categories: formData.categories,
      subcategories: formData.subcategories,
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

    try {
      if (product) {
        await updateProduct(productData);
        toast({ title: "Producto actualizado", description: "Los cambios se han guardado correctamente." });
      } else {
        await addProduct(productData);
        toast({ title: "Producto creado", description: "El producto se ha añadido correctamente." });
      }
      onClose();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo guardar el producto.",
        variant: "destructive"
      });
    }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Solo se permiten imágenes (JPG, PNG, WEBP, GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo permitido es 5MB",
        variant: "destructive",
      });
      return;
    }

    // Open crop editor with the selected file
    setSelectedFile(file);
    setCropEditorOpen(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropEditorOpen(false);
    setIsUploading(true);

    try {
      // Upload cropped image to Supabase Storage
      const imageUrl = await uploadImage(croppedFile);

      // Add the URL to the images array
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));

      toast({
        title: "Imagen subida",
        description: "La imagen se ha recortado y subido correctamente",
      });

      // Reset file input and selected file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo subir la imagen. Verifica tu configuración de Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropEditorOpen(false);
    setSelectedFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const handleDuplicate = async () => {
    if (!product) return;

    try {
      await duplicateProduct(product);
      toast({
        title: "Producto duplicado",
        description: "Se ha creado una copia del producto"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo duplicar el producto.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente"
      });
      setDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="fixed inset-0 flex h-[100dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:h-[85vh] lg:w-[900px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl lg:border"
      >
        {/* Fixed Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6 lg:rounded-t-xl">
          <DialogTitle className="text-lg font-semibold">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {product && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDuplicate}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  title="Duplicar producto"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  title="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
            {/* Fixed Tabs Bar */}
            <div className="shrink-0 border-b border-border bg-background px-4 lg:px-6">
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
              <div className="px-4 py-4 lg:px-6">
                <TabsContent value="general" className="m-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nombre del producto"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio <span className="text-destructive">*</span></Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
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
                      <Label>Categorías</Label>
                      <div className="rounded-lg border border-border bg-background p-3 max-h-[200px] overflow-y-auto">
                        {categories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No hay categorías disponibles</p>
                        ) : (
                          <div className="space-y-2">
                            {categories.map((cat) => (
                              <div key={cat.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`cat-${cat.id}`}
                                  checked={formData.categories.includes(cat.name)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData({ ...formData, categories: [...formData.categories, cat.name] });
                                    } else {
                                      // Remove category and its related subcategories
                                      const categoryToRemove = categories.find((c) => c.name === cat.name);
                                      const subcatsToRemove = subcategories
                                        .filter((sub) => sub.categoryId === categoryToRemove?.id)
                                        .map((sub) => sub.name);
                                      setFormData({
                                        ...formData,
                                        categories: formData.categories.filter((c) => c !== cat.name),
                                        subcategories: formData.subcategories.filter((s) => !subcatsToRemove.includes(s))
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor={`cat-${cat.id}`} className="text-sm font-normal cursor-pointer">
                                  {cat.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategorías</Label>
                      <div className="rounded-lg border border-border bg-background p-3 max-h-[200px] overflow-y-auto">
                        {formData.categories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Selecciona una categoría primero</p>
                        ) : filteredSubcategories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No hay subcategorías disponibles</p>
                        ) : (
                          <div className="space-y-2">
                            {filteredSubcategories.map((sub) => (
                              <div key={sub.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`sub-${sub.id}`}
                                  checked={formData.subcategories.includes(sub.name)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData({ ...formData, subcategories: [...formData.subcategories, sub.name] });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        subcategories: formData.subcategories.filter((s) => s !== sub.name)
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor={`sub-${sub.id}`} className="text-sm font-normal cursor-pointer">
                                  {sub.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">O</span>
                    </div>
                  </div>

                  {/* Upload image file */}
                  <div className="space-y-2">
                    <Label>Subir imagen desde tu dispositivo</Label>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Seleccionar imagen
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Formatos permitidos: JPG, PNG, WEBP, GIF. Tamaño máximo: 5MB
                      </p>
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
          <div className="shrink-0 border-t border-border bg-background px-4 py-4 lg:px-6 lg:rounded-b-xl">
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

      {/* Image Crop Editor */}
      <ImageCropEditor
        open={cropEditorOpen}
        imageFile={selectedFile}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto "{product?.name}" de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};