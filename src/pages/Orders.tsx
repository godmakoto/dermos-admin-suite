import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderModal } from "@/components/orders/OrderModal";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Orders = () => {
  const { orders, orderStatuses } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (statusName: string) => {
    const status = orderStatuses.find((s) => s.name === statusName);
    return status?.color || "#6b7280";
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const columns = [
    {
      key: "id",
      label: "Pedido",
      render: (order: Order) => (
        <span className="font-medium">{order.id}</span>
      ),
    },
    {
      key: "items",
      label: "Productos",
      render: (order: Order) => (
        <span className="text-sm">
          {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (order: Order) => (
        <div>
          <span className="font-medium">Bs {order.total.toFixed(1)}</span>
          {order.discount > 0 && (
            <p className="text-xs text-destructive">
              -Bs {order.discount.toFixed(1)} desc.
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (order: Order) => (
        <StatusBadge label={order.status} color={getStatusColor(order.status)} />
      ),
    },
    {
      key: "date",
      label: "Fecha",
      render: (order: Order) => (
        <span className="text-sm text-muted-foreground">
          {format(order.createdAt, "dd MMM yyyy", { locale: es })}
        </span>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader title="Pedidos" description="Gestiona los pedidos de tus clientes" />

      <DataTable
        columns={columns}
        data={orders}
        onRowClick={handleEdit}
        emptyMessage="No hay pedidos registrados."
      />

      <OrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={selectedOrder}
      />
    </MainLayout>
  );
};

export default Orders;
