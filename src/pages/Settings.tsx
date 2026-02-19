import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Layers, Bookmark, Flag, Moon } from "lucide-react";
import { ProductCarouselState } from "@/types";

const Settings = () => {
  const {
    categories,
    subcategories,
    brands,
    labels,
    productCarouselStates,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    addBrand,
    updateBrand,
    deleteBrand,
    addLabel,
    updateLabel,
    deleteLabel,
    addProductCarouselState,
    deleteProductCarouselState,
    isDarkMode,
    toggleDarkMode,
    hideOutOfStock,
    toggleHideOutOfStock,
  } = useApp();
  const { toast } = useToast();

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState({ name: "", categoryId: "" });
  const [newBrand, setNewBrand] = useState("");
  const [newLabel, setNewLabel] = useState({ name: "", color: "#6b7280" });
  const [newCarouselState, setNewCarouselState] = useState({ name: "", type: "carousel" as "carousel" | "banner", color: "#6b7280" });

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'category' | 'subcategory' | 'brand' | 'label' | 'carouselState' | null;
    id: string;
    name: string;
  } | null>(null);

  // Editing states
  const [editingItem, setEditingItem] = useState<{
    type: 'category' | 'subcategory' | 'brand' | 'label' | null;
    id: string;
    value: string;
  } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory({ id: `${Date.now()}`, name: newCategory.trim() });
      setNewCategory("");
      toast({ title: "Categoría agregada" });
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.name.trim() && newSubcategory.categoryId) {
      addSubcategory({
        id: `${Date.now()}`,
        name: newSubcategory.name.trim(),
        categoryId: newSubcategory.categoryId,
      });
      setNewSubcategory({ name: "", categoryId: "" });
      toast({ title: "Subcategoría agregada" });
    }
  };

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      addBrand({ id: `${Date.now()}`, name: newBrand.trim() });
      setNewBrand("");
      toast({ title: "Marca agregada" });
    }
  };

  const handleAddLabel = () => {
    if (newLabel.name.trim()) {
      addLabel({ id: `${Date.now()}`, name: newLabel.name.trim(), color: "#6b7280" });
      setNewLabel({ name: "", color: "#6b7280" });
      toast({ title: "Propiedad agregada" });
    }
  };

  const handleAddCarouselState = () => {
    if (newCarouselState.name.trim()) {
      addProductCarouselState({ id: `${Date.now()}`, name: newCarouselState.name.trim(), type: newCarouselState.type, color: "#6b7280" });
      setNewCarouselState({ name: "", type: "carousel", color: "#6b7280" });
      toast({ title: "Estado de carrusel agregado" });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;

    switch (deleteConfirm.type) {
      case 'category':
        deleteCategory(deleteConfirm.id);
        toast({ title: "Categoría eliminada" });
        break;
      case 'subcategory':
        deleteSubcategory(deleteConfirm.id);
        toast({ title: "Subcategoría eliminada" });
        break;
      case 'brand':
        deleteBrand(deleteConfirm.id);
        toast({ title: "Marca eliminada" });
        break;
      case 'label':
        deleteLabel(deleteConfirm.id);
        toast({ title: "Propiedad eliminada" });
        break;
      case 'carouselState':
        deleteProductCarouselState(deleteConfirm.id);
        toast({ title: "Estado de carrusel eliminado" });
        break;
    }

    setDeleteConfirm(null);
  };

  const handleOpenEditDialog = (type: 'category' | 'subcategory' | 'brand' | 'label', id: string, value: string) => {
    setEditingItem({ type, id, value });
    setEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.value.trim()) return;

    try {
      switch (editingItem.type) {
        case 'category':
          await updateCategory(editingItem.id, editingItem.value.trim());
          toast({ title: "Categoría actualizada" });
          break;
        case 'subcategory':
          await updateSubcategory(editingItem.id, editingItem.value.trim());
          toast({ title: "Subcategoría actualizada" });
          break;
        case 'brand':
          await updateBrand(editingItem.id, editingItem.value.trim());
          toast({ title: "Marca actualizada" });
          break;
        case 'label':
          await updateLabel(editingItem.id, editingItem.value.trim());
          toast({ title: "Propiedad actualizada" });
          break;
      }
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el elemento",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Configuración"
        description="Administra las opciones de tu tienda"
      />

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="categories" className="gap-2 flex-1 justify-center">
            <Layers className="h-4 w-4" />
            <span className="hidden lg:inline">Categorías</span>
          </TabsTrigger>
          <TabsTrigger value="brands" className="gap-2 flex-1 justify-center">
            <Bookmark className="h-4 w-4" />
            <span className="hidden lg:inline">Marcas y Propiedades</span>
          </TabsTrigger>
          <TabsTrigger value="statuses" className="gap-2 flex-1 justify-center">
            <Flag className="h-4 w-4" />
            <span className="hidden lg:inline">Estados</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 flex-1 justify-center">
            <Moon className="h-4 w-4" />
            <span className="hidden lg:inline">Apariencia</span>
          </TabsTrigger>
        </TabsList>

        {/* Categories & Subcategories */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>Gestiona las categorías de productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nueva categoría"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5"
                  >
                    <span
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleOpenEditDialog('category', cat.id, cat.name)}
                    >
                      {cat.name}
                    </span>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subcategorías</CardTitle>
              <CardDescription>Gestiona las subcategorías de productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row">
                <Select
                  value={newSubcategory.categoryId}
                  onValueChange={(value) =>
                    setNewSubcategory({ ...newSubcategory, categoryId: value })
                  }
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Nueva subcategoría"
                    value={newSubcategory.name}
                    onChange={(e) =>
                      setNewSubcategory({ ...newSubcategory, name: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddSubcategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const subs = subcategories.filter((s) => s.categoryId === cat.id);
                  if (subs.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {cat.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5"
                          >
                            <span
                              className="text-sm cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleOpenEditDialog('subcategory', sub.id, sub.name)}
                            >
                              {sub.name}
                            </span>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'subcategory', id: sub.id, name: sub.name })}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brands & Labels */}
        <TabsContent value="brands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marcas</CardTitle>
              <CardDescription>Gestiona las marcas de productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nueva marca"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddBrand()}
                />
                <Button onClick={handleAddBrand}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5"
                  >
                    <span
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleOpenEditDialog('brand', brand.id, brand.name)}
                    >
                      {brand.name}
                    </span>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'brand', id: brand.id, name: brand.name })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propiedades</CardTitle>
              <CardDescription>Gestiona las propiedades de productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nueva propiedad"
                  value={newLabel.name}
                  onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                  className="flex-1"
                />
                <Button onClick={handleAddLabel}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5"
                  >
                    <span
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleOpenEditDialog('label', label.id, label.name)}
                    >
                      {label.name}
                    </span>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'label', id: label.id, name: label.name })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Carousel States */}
        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <CardTitle>Estados de Carruseles</CardTitle>
              <CardDescription>Gestiona los estados para carruseles y banners de productos en tu web</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row">
                <Select
                  value={newCarouselState.type}
                  onValueChange={(value: "carousel" | "banner") =>
                    setNewCarouselState({ ...newCarouselState, type: value })
                  }
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carousel">Carrusel</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Nombre del estado"
                    value={newCarouselState.name}
                    onChange={(e) => setNewCarouselState({ ...newCarouselState, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCarouselState()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddCarouselState}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {productCarouselStates.map((state) => (
                  <div
                    key={state.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5"
                  >
                    <span className="text-sm">{state.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({state.type === "carousel" ? "Carrusel" : "Banner"})
                    </span>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'carouselState', id: state.id, name: state.name })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia del panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Modo Oscuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa el tema oscuro para el panel de administración
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hide-out-of-stock">Ocultar productos sin stock</Label>
                  <p className="text-sm text-muted-foreground">
                    Los productos sin stock no se mostrarán en la web del cliente
                  </p>
                </div>
                <Switch
                  id="hide-out-of-stock"
                  checked={hideOutOfStock}
                  onCheckedChange={toggleHideOutOfStock}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm && (
                <>
                  Estás a punto de eliminar{" "}
                  {deleteConfirm.type === 'category' && 'la categoría'}
                  {deleteConfirm.type === 'subcategory' && 'la subcategoría'}
                  {deleteConfirm.type === 'brand' && 'la marca'}
                  {deleteConfirm.type === 'label' && 'la propiedad'}
                  {deleteConfirm.type === 'carouselState' && 'el estado de carrusel'}
                  {' '}<strong>"{deleteConfirm.name}"</strong>.
                  {' '}Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Editar {editingItem?.type === 'category' && 'categoría'}
              {editingItem?.type === 'subcategory' && 'subcategoría'}
              {editingItem?.type === 'brand' && 'marca'}
              {editingItem?.type === 'label' && 'propiedad'}
            </DialogTitle>
            <DialogDescription>
              Modifica el nombre y presiona Guardar para aplicar los cambios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-name" className="mb-2 block">
              Nombre
            </Label>
            <Input
              id="edit-name"
              value={editingItem?.value || ''}
              onChange={(e) => editingItem && setEditingItem({ ...editingItem, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
              placeholder="Ingresa el nombre..."
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Settings;
