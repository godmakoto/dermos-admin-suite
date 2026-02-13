import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
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
import { GripVertical, Link as LinkIcon, Upload, Loader2, Copy, Trash2, ChevronsUpDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Product } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/supabase";
import { ImageCropEditor } from "@/components/ImageCropEditor";

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, subcategories, brands, labels, productCarouselStates, addProduct, updateProduct, duplicateProduct, deleteProduct } = useApp();
  const { toast } = useToast();

  const product = id ? products.find((p) => p.id === id) : null;
  const isEditing = !!product;

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
    }
  }, [product]);

  // Filter subcategories based on selected categories
  const filteredSubcategories = subcategories.filter((sub) => {
    const selectedCategoryIds = formData.categories
      .map((catName) => categories.find((c) => c.name === catName)?.id)
      .filter(Boolean);
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
      navigate("/products");
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

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo invalido",
        description: "Solo se permiten imagenes (JPG, PNG, WEBP, GIF)",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El tamano maximo permitido es 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setCropEditorOpen(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropEditorOpen(false);
    setIsUploading(true);

    try {
      const url = await uploadImage(croppedFile);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
      toast({ title: "Imagen subida", description: "La imagen se ha recortado y subido correctamente" });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo subir la imagen. Verifica tu configuracion de Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropEditorOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      toast({ title: "Producto duplicado", description: "Se ha creado una copia del producto" });
      navigate("/products");
    } catch (error) {
      toast({ title: "Error", description: "No se pudo duplicar el producto.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!product) return;
    try {
      await deleteProduct(product.id);
      toast({ title: "Producto eliminado", description: "El producto ha sido eliminado correctamente" });
      setDeleteDialogOpen(false);
      navigate("/products");
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
    }
  };

  const goBack = () => navigate("/products");

  return (
    <AppLayout>
      <PageHeader
        title={isEditing ? "Editar Producto" : "Nuevo Producto"}
        description={isEditing ? product?.name : "Crear un nuevo producto"}
      >
        <div className="flex items-center gap-2">
          {isEditing && (
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
                onClick={() => setDeleteDialogOpen(true)}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                title="Eliminar producto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
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

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="images">Imagenes</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
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
                  placeholder="Dejar vacio si no hay oferta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categorias</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between font-normal">
                      <span className="truncate">
                        {formData.categories.length === 0
                          ? "Seleccionar categorias"
                          : formData.categories.join(", ")}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[200px] overflow-y-auto" align="start">
                    {categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">No hay categorias disponibles</p>
                    ) : (
                      categories.map((cat) => (
                        <DropdownMenuCheckboxItem
                          key={cat.id}
                          checked={formData.categories.includes(cat.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, categories: [...formData.categories, cat.name] });
                            } else {
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
                          onSelect={(e) => e.preventDefault()}
                        >
                          {cat.name}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label>Subcategorias</Label>
                <div className="rounded-lg border border-border bg-background p-3 max-h-[200px] overflow-y-auto">
                  {formData.categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Selecciona una categoria primero</p>
                  ) : filteredSubcategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay subcategorias disponibles</p>
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
                <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Propiedad</Label>
                <Select value={formData.label} onValueChange={(value) => setFormData({ ...formData, label: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    {labels.map((label) => (
                      <SelectItem key={label.id} value={label.name}>{label.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado de Carrusel</Label>
              <Select value={formData.carouselState} onValueChange={(value) => setFormData({ ...formData, carouselState: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado de carrusel" />
                </SelectTrigger>
                <SelectContent>
                  {productCarouselStates.map((state) => (
                    <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
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
              <Label htmlFor="shortDescription">Descripcion corta</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Breve descripcion del producto"
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="longDescription">Descripcion larga</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                placeholder="Descripcion detallada del producto"
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

          <TabsContent value="images" className="space-y-4">
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O</span>
              </div>
            </div>

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
                  Formatos permitidos: JPG, PNG, WEBP, GIF. Tamano maximo: 5MB
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagenes ({formData.images.length})</Label>
              <div className="space-y-3">
                {formData.images.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <p className="text-sm text-muted-foreground">No hay imagenes agregadas</p>
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
                          <Button type="button" variant="outline" size="sm" onClick={() => moveImage(index, index - 1)} className="h-9 w-9 p-0">
                            ↑
                          </Button>
                        )}
                        {index < formData.images.length - 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => moveImage(index, index + 1)} className="h-9 w-9 p-0">
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
        </Tabs>

        {/* Footer Actions */}
        <div className="sticky bottom-0 -mx-4 lg:-mx-6 mt-6 border-t border-border bg-background px-4 py-4 lg:px-6">
          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </div>
      </form>

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
            <AlertDialogTitle>Estas seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el producto "{product?.name}" de forma permanente.
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
    </AppLayout>
  );
};

export default ProductForm;
