import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { Package, ShoppingCart, Tag, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { products, orders, categories, brands } = useApp();

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "Pendiente").length;

  const stats = [
    {
      title: "Total Productos",
      value: products.length,
      icon: Package,
      description: "Productos activos",
    },
    {
      title: "Pedidos Pendientes",
      value: pendingOrders,
      icon: ShoppingCart,
      description: "Requieren atención",
    },
    {
      title: "Ingresos Totales",
      value: `Bs ${totalRevenue.toFixed(1)}`,
      icon: TrendingUp,
      description: "Todos los pedidos",
    },
    {
      title: "Categorías",
      value: categories.length,
      icon: Tag,
      description: "Categorías activas",
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Resumen general de tu tienda dermocosmética"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        {/* Recent Orders */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Bs {order.total.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
