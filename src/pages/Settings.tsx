import { useState, useRef } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Tag, Layers, Bookmark, Flag, Moon, Trash2, Upload, Database } from "lucide-react";
import { Product, ProductCarouselState } from "@/types";

const Settings = () => {
  const {
    categories,
    subcategories,
    brands,
    labels,
    productCarouselStates,
    addCategory,
    deleteCategory,
    deleteAllCategories,
    addSubcategory,
    deleteSubcategory,
    deleteAllSubcategories,
    addBrand,
    deleteBrand,
    addLabel,
    deleteLabel,
    deleteAllLabels,
    resetStore,
    addProductCarouselState,
    deleteProductCarouselState,
    deleteAllProducts,
    importProducts,
    isDarkMode,
    toggleDarkMode,
  } = useApp();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState({ name: "", categoryId: "" });
  const [newBrand, setNewBrand] = useState("");
  const [newLabel, setNewLabel] = useState({ name: "", color: "#6b7280" });
  const [newCarouselState, setNewCarouselState] = useState({ name: "", type: "carousel" as "carousel" | "banner", color: "#6b7280" });

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

  const handleDeleteAllProducts = () => {
    deleteAllProducts();
    toast({ title: "Productos eliminados", description: "Todos los productos han sido eliminados." });
  };

  const handleDeleteAllCategories = () => {
    deleteAllCategories();
    toast({ title: "Categorías eliminadas", description: "Todas las categorías han sido eliminadas." });
  };

  const handleDeleteAllSubcategories = () => {
    deleteAllSubcategories();
    toast({ title: "Subcategorías eliminadas", description: "Todas las subcategorías han sido eliminadas." });
  };

  const handleResetStore = () => {
    resetStore();
    toast({ title: "Tienda reiniciada", description: "Todos los datos han sido eliminados." });
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        
        if (lines.length < 2) {
          toast({ title: "Error", description: "El archivo CSV está vacío o no tiene datos.", variant: "destructive" });
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const products: Product[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const statusValue = values[headers.indexOf("status")] || values[headers.indexOf("estado")] || "Activo";
          const validStatus = ["Activo", "Inactivo", "Agotado"].includes(statusValue) ? statusValue as Product["status"] : "Activo";
          
          const product: Product = {
            id: `imported-${Date.now()}-${i}`,
            name: values[headers.indexOf("name")] || values[headers.indexOf("nombre")] || `Producto ${i}`,
            price: parseFloat(values[headers.indexOf("price")] || values[headers.indexOf("precio")] || "0"),
            category: values[headers.indexOf("category")] || values[headers.indexOf("categoria")] || "Sin categoría",
            subcategory: values[headers.indexOf("subcategory")] || values[headers.indexOf("subcategoria")] || "",
            brand: values[headers.indexOf("brand")] || values[headers.indexOf("marca")] || "Sin marca",
            label: values[headers.indexOf("label")] || values[headers.indexOf("etiqueta")] || "",
            shortDescription: values[headers.indexOf("shortdescription")] || values[headers.indexOf("descripcion_corta")] || "",
            longDescription: values[headers.indexOf("longdescription")] || values[headers.indexOf("descripcion_larga")] || "",
            usage: values[headers.indexOf("usage")] || values[headers.indexOf("uso")] || "",
            ingredients: values[headers.indexOf("ingredients")] || values[headers.indexOf("ingredientes")] || "",
            images: [values[headers.indexOf("image")] || values[headers.indexOf("imagen")] || "/placeholder.svg"],
            trackStock: false,
            stock: parseInt(values[headers.indexOf("stock")] || "0"),
            status: validStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          products.push(product);
        }

        importProducts(products);
        toast({ title: "Productos importados", description: `Se importaron ${products.length} productos correctamente.` });
      } catch {
        toast({ title: "Error", description: "No se pudo procesar el archivo CSV.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Configuración"
        description="Administra las opciones de tu tienda"
      />

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="categories" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Categorías</span>
          </TabsTrigger>
          <TabsTrigger value="brands" className="gap-2">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Marcas</span>
          </TabsTrigger>
          <TabsTrigger value="labels" className="gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Propiedades</span>
          </TabsTrigger>
          <TabsTrigger value="statuses" className="gap-2">
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Estados</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Datos</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Apariencia</span>
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
                    <span className="text-sm">{cat.name}</span>
                    <button
                      onClick={() => deleteCategory(cat.id)}
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
                            <span className="text-sm">{sub.name}</span>
                            <button
                              onClick={() => deleteSubcategory(sub.id)}
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

        {/* Brands */}
        <TabsContent value="brands">
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
                    <span className="text-sm">{brand.name}</span>
                    <button
                      onClick={() => deleteBrand(brand.id)}
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

        {/* Labels */}
        <TabsContent value="labels">
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
                    <span className="text-sm">{label.name}</span>
                    <button
                      onClick={() => deleteLabel(label.id)}
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
                      onClick={() => deleteProductCarouselState(state.id)}
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

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Importar Datos</CardTitle>
              <CardDescription>Importa productos desde un archivo CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Importar Productos (CSV)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  El archivo CSV debe tener columnas: name/nombre, price/precio, category/categoria, brand/marca, stock, status/estado
                </p>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
              <CardDescription>Estas acciones son irreversibles. Procede con precaución.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Delete All Products */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar todos los productos
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar todos los productos?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán permanentemente todos los productos de tu tienda.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllProducts} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Eliminar todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete All Categories */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar todas las categorías
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar todas las categorías?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán permanentemente todas las categorías.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllCategories} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Eliminar todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete All Subcategories */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar todas las subcategorías
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar todas las subcategorías?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán permanentemente todas las subcategorías.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllSubcategories} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Eliminar todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Reset Store */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reiniciar tienda
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Reiniciar toda la tienda?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán permanentemente TODOS los datos: productos, pedidos, categorías, subcategorías, marcas, etiquetas y estados de pedido.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetStore} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Reiniciar todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
