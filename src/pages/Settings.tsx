import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Tag, Layers, Bookmark, Flag, Moon } from "lucide-react";

const Settings = () => {
  const {
    categories,
    subcategories,
    brands,
    labels,
    orderStatuses,
    addCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    addBrand,
    deleteBrand,
    addLabel,
    deleteLabel,
    addOrderStatus,
    deleteOrderStatus,
    isDarkMode,
    toggleDarkMode,
  } = useApp();
  const { toast } = useToast();

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState({ name: "", categoryId: "" });
  const [newBrand, setNewBrand] = useState("");
  const [newLabel, setNewLabel] = useState({ name: "", color: "#3b82f6" });
  const [newStatus, setNewStatus] = useState({ name: "", color: "#3b82f6" });

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
      addLabel({ id: `${Date.now()}`, ...newLabel });
      setNewLabel({ name: "", color: "#3b82f6" });
      toast({ title: "Etiqueta agregada" });
    }
  };

  const handleAddStatus = () => {
    if (newStatus.name.trim()) {
      addOrderStatus({ id: `${Date.now()}`, ...newStatus });
      setNewStatus({ name: "", color: "#3b82f6" });
      toast({ title: "Estado agregado" });
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Configuración"
        description="Administra las opciones de tu tienda"
      />

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
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
            <span className="hidden sm:inline">Etiquetas</span>
          </TabsTrigger>
          <TabsTrigger value="statuses" className="gap-2">
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Estados</span>
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
              <div className="flex gap-2">
                <Select
                  value={newSubcategory.categoryId}
                  onValueChange={(value) =>
                    setNewSubcategory({ ...newSubcategory, categoryId: value })
                  }
                >
                  <SelectTrigger className="w-48">
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
              <CardTitle>Etiquetas</CardTitle>
              <CardDescription>Gestiona las etiquetas de productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nueva etiqueta"
                  value={newLabel.name}
                  onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={newLabel.color}
                  onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                  className="w-14 p-1"
                />
                <Button onClick={handleAddLabel}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5"
                    style={{ backgroundColor: `${label.color}20` }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
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

        {/* Order Statuses */}
        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <CardTitle>Estados de Pedido</CardTitle>
              <CardDescription>Gestiona los estados de los pedidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nuevo estado"
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                  className="w-14 p-1"
                />
                <Button onClick={handleAddStatus}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {orderStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5"
                    style={{ backgroundColor: `${status.color}20` }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm">{status.name}</span>
                    <button
                      onClick={() => deleteOrderStatus(status.id)}
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
    </MainLayout>
  );
};

export default Settings;
