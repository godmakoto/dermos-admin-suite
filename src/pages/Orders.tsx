import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderModal } from "@/components/orders/OrderModal";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Search, CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const Orders = () => {
  const { orders, orderStatuses } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

  const getStatusColor = (statusName: string) => {
    const status = orderStatuses.find((s) => s.name === statusName);
    return status?.color || "#6b7280";
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  // Get date-filtered orders for indicators (based on date filter only, not status)
  const dateFilteredOrders = useMemo(() => {
    let result = [...orders];

    if (dateFilter === "today") {
      result = result.filter((o) => isToday(o.createdAt));
    } else if (dateFilter === "yesterday") {
      result = result.filter((o) => isYesterday(o.createdAt));
    } else if (dateFilter === "thisWeek") {
      result = result.filter((o) => isThisWeek(o.createdAt, { weekStartsOn: 1 }));
    } else if (dateFilter === "thisMonth") {
      result = result.filter((o) => isThisMonth(o.createdAt));
    } else if (dateFilter === "selectDate" && selectedDate) {
      result = result.filter((o) => 
        format(o.createdAt, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      );
    } else if (dateFilter === "selectRange" && dateRange.from && dateRange.to) {
      result = result.filter((o) => 
        isWithinInterval(o.createdAt, { start: dateRange.from!, end: dateRange.to! })
      );
    }

    return result;
  }, [orders, dateFilter, selectedDate, dateRange]);

  // Summary counts based on date filter
  const pendingCount = dateFilteredOrders.filter((o) => o.status === "Pendiente").length;
  const completedCount = dateFilteredOrders.filter((o) => o.status === "Finalizado").length;
  const cancelledCount = dateFilteredOrders.filter((o) => o.status === "Cancelado").length;
  const totalOrders = dateFilteredOrders.length;
  const totalRevenue = dateFilteredOrders.reduce((sum, o) => sum + o.total, 0);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(query));
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Date filter
    if (dateFilter === "today") {
      result = result.filter((o) => isToday(o.createdAt));
    } else if (dateFilter === "yesterday") {
      result = result.filter((o) => isYesterday(o.createdAt));
    } else if (dateFilter === "thisWeek") {
      result = result.filter((o) => isThisWeek(o.createdAt, { weekStartsOn: 1 }));
    } else if (dateFilter === "thisMonth") {
      result = result.filter((o) => isThisMonth(o.createdAt));
    } else if (dateFilter === "selectDate" && selectedDate) {
      result = result.filter((o) => 
        format(o.createdAt, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      );
    } else if (dateFilter === "selectRange" && dateRange.from && dateRange.to) {
      result = result.filter((o) => 
        isWithinInterval(o.createdAt, { start: dateRange.from!, end: dateRange.to! })
      );
    }

    return result;
  }, [orders, searchQuery, statusFilter, dateFilter, selectedDate, dateRange]);

  const columns = [
    {
      key: "id",
      label: "Pedido",
      render: (order: Order) => (
        <div>
          <span className="font-medium">{order.id}</span>
          <p className="text-xs text-muted-foreground">
            {format(order.createdAt, "dd MMM yyyy", { locale: es })}
          </p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Item",
      render: (order: Order) => (
        <span className="text-sm">
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
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
  ];

  return (
    <MainLayout>
      <PageHeader title="Gestión de Pedidos" description="Click en cualquier pedido para ver detalles y editar" />

      {/* Search and Filters */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mobile filter button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos los días" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los días</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="yesterday">Ayer</SelectItem>
                      <SelectItem value="thisWeek">Esta semana</SelectItem>
                      <SelectItem value="thisMonth">Este mes</SelectItem>
                      <SelectItem value="selectDate">Seleccionar fecha</SelectItem>
                      <SelectItem value="selectRange">Seleccionar rango</SelectItem>
                    </SelectContent>
                  </Select>
                  {dateFilter === "selectDate" && (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="pointer-events-auto mt-2"
                    />
                  )}
                  {dateFilter === "selectRange" && (
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      className="pointer-events-auto mt-2"
                      numberOfMonths={1}
                    />
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Desktop filters */}
          <div className="hidden lg:flex lg:gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Finalizado">Finalizado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48 justify-between">
                  <span>
                    {dateFilter === "all" && "Todos los días"}
                    {dateFilter === "today" && "Hoy"}
                    {dateFilter === "yesterday" && "Ayer"}
                    {dateFilter === "thisWeek" && "Esta semana"}
                    {dateFilter === "thisMonth" && "Este mes"}
                    {dateFilter === "selectDate" && selectedDate && format(selectedDate, "dd/MM/yyyy")}
                    {dateFilter === "selectRange" && dateRange.from && dateRange.to && 
                      `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}`}
                    {dateFilter === "selectDate" && !selectedDate && "Seleccionar fecha"}
                    {dateFilter === "selectRange" && (!dateRange.from || !dateRange.to) && "Seleccionar rango"}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex flex-col">
                  <button
                    className={cn("px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === "all" && "bg-muted")}
                    onClick={() => setDateFilter("all")}
                  >
                    Todos los días
                  </button>
                  <button
                    className={cn("px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === "today" && "bg-muted")}
                    onClick={() => setDateFilter("today")}
                  >
                    Hoy
                  </button>
                  <button
                    className={cn("px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === "yesterday" && "bg-muted")}
                    onClick={() => setDateFilter("yesterday")}
                  >
                    Ayer
                  </button>
                  <button
                    className={cn("px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === "thisWeek" && "bg-muted")}
                    onClick={() => setDateFilter("thisWeek")}
                  >
                    Esta semana
                  </button>
                  <button
                    className={cn("px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === "thisMonth" && "bg-muted")}
                    onClick={() => setDateFilter("thisMonth")}
                  >
                    Este mes
                  </button>
                  <div className="border-t border-border">
                    <button
                      className={cn("w-full px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === "selectDate" && "bg-muted")}
                      onClick={() => setDateFilter("selectDate")}
                    >
                      Seleccionar fecha
                    </button>
                    {dateFilter === "selectDate" && (
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="pointer-events-auto"
                      />
                    )}
                  </div>
                  <div className="border-t border-border">
                    <button
                      className={cn("w-full px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === "selectRange" && "bg-muted")}
                      onClick={() => setDateFilter("selectRange")}
                    >
                      Seleccionar rango
                    </button>
                    {dateFilter === "selectRange" && (
                      <Calendar
                        mode="range"
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                        className="pointer-events-auto"
                        numberOfMonths={1}
                      />
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        onRowClick={handleEdit}
        emptyMessage="No hay pedidos que coincidan con los filtros."
      />

      {/* Summary Indicators */}
      <div className="mt-6 space-y-4">
        {/* Status indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Finalizados</p>
            <p className="text-2xl font-semibold text-green-500">{completedCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-semibold text-yellow-500">{pendingCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Cancelados</p>
            <p className="text-2xl font-semibold text-destructive">{cancelledCount}</p>
          </div>
        </div>

        {/* Totals indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de Pedidos</p>
            <p className="text-2xl font-semibold text-foreground">{totalOrders}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            <p className="text-2xl font-semibold text-green-500">{totalRevenue.toFixed(1)} Bs</p>
          </div>
        </div>
      </div>

      <OrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={selectedOrder}
      />
    </MainLayout>
  );
};

export default Orders;
