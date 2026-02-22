import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Search, CalendarIcon, SlidersHorizontal, Plus, Loader2 } from "lucide-react";
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
  const navigate = useNavigate();
  const { orders, isLoadingOrders, orderStatuses, updateOrder } = useApp();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Handlers that close the mobile filter popover after changing filter
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setFilterPopoverOpen(false);
  };

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    if (filter !== "selectDate" && filter !== "selectRange") {
      setDatePopoverOpen(false);
      setFilterPopoverOpen(false);
    }
  };

  const getStatusColor = (statusName: string) => {
    const status = orderStatuses.find((s) => s.name === statusName);
    return status?.color || "#6b7280";
  };

  const handleEdit = (order: Order) => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleCreateOrder = () => {
    navigate("/orders/new");
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      // Find the status_id for the new status
      const statusObj = orderStatuses.find((s) => s.name === newStatus);
      if (statusObj) {
        try {
          await updateOrder({ ...order, status: newStatus, status_id: statusObj.id });
        } catch (error) {
          console.error('Failed to update order status:', error);
        }
      }
    }
  };

  // Get date-filtered orders for indicators
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

  // Summary counts
  const pendingCount = dateFilteredOrders.filter((o) => o.status === "Pendiente").length;
  const completedCount = dateFilteredOrders.filter((o) => o.status === "Finalizado").length;
  const totalRevenue = dateFilteredOrders
    .filter((o) => o.status !== "Cancelado")
    .reduce((sum, o) => sum + o.total, 0);

  // Get dynamic label for the revenue indicator
  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Hoy";
      case "yesterday":
        return "Ayer";
      case "thisWeek":
        return "Esta semana";
      case "thisMonth":
        return "Este mes";
      case "selectDate":
        return selectedDate ? format(selectedDate, "dd/MM", { locale: es }) : "Fecha";
      case "selectRange":
        return dateRange.from && dateRange.to
          ? `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}`
          : "Rango";
      case "all":
      default:
        return "Total";
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(query) ||
          o.customer_name.toLowerCase().includes(query) ||
          o.customer_phone.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

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

    // Ordenar por defecto: más recientes primero
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [orders, searchQuery, statusFilter, dateFilter, selectedDate, dateRange]);

  const columns = [
    {
      key: "order_number",
      label: "Pedido",
      className: "w-[35%] text-center",
      render: (order: Order) => (
        <div className="flex flex-col items-center">
          <span className="font-medium text-sm">{order.order_number}</span>
          <p className="text-xs text-muted-foreground">
            {format(order.createdAt, "dd MMM", { locale: es })}
          </p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      className: "w-auto text-center",
      render: (order: Order) => (
        <span className="font-medium text-sm whitespace-nowrap">Bs {order.total.toFixed(0)}</span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      className: "w-auto text-center",
      render: (order: Order) => (
        <div className="flex justify-center">
          <OrderStatusSelect
            value={order.status}
            onChange={(value) => handleStatusChange(order.id, value)}
            statuses={orderStatuses}
          />
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader title="Pedidos" description={`${filteredOrders.length} pedidos`}>
        <Button onClick={handleCreateOrder} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Crear</span>
        </Button>
      </PageHeader>

      {/* Summary - Compact */}
      <div className="grid grid-cols-2 gap-2 mb-4 lg:flex lg:gap-2">
        <div className="col-span-2 lg:col-span-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm whitespace-nowrap">
          <span className="text-muted-foreground">{getDateFilterLabel()}</span>
          <span className="font-semibold">Bs {totalRevenue.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/15 text-warning text-sm whitespace-nowrap">
          <span>Pendientes</span>
          <span className="font-semibold">{pendingCount}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success text-sm whitespace-nowrap">
          <span>Completados</span>
          <span className="font-semibold">{completedCount}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pedido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
            autoComplete="chrome-off"
            autoCorrect="off"
            autoCapitalize="off"
            data-form-type="other"
          />
        </div>

        {/* Mobile filter button */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Estado</label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fecha</label>
                <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Hoy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="thisWeek">Esta semana</SelectItem>
                    <SelectItem value="thisMonth">Este mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Desktop filters */}
        <div className="hidden lg:flex lg:gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-36 h-10 justify-between">
                <span className="text-sm truncate">
                  {dateFilter === "all" && "Todos"}
                  {dateFilter === "today" && "Hoy"}
                  {dateFilter === "yesterday" && "Ayer"}
                  {dateFilter === "thisWeek" && "Semana"}
                  {dateFilter === "thisMonth" && "Mes"}
                  {dateFilter === "selectDate" && selectedDate && format(selectedDate, "dd/MM")}
                </span>
                <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex flex-col">
                {["all", "today", "yesterday", "thisWeek", "thisMonth"].map((filter) => (
                  <button
                    key={filter}
                    className={cn("px-4 py-2 text-left text-sm hover:bg-muted", dateFilter === filter && "bg-muted")}
                    onClick={() => handleDateFilterChange(filter)}
                  >
                    {filter === "all" && "Todos"}
                    {filter === "today" && "Hoy"}
                    {filter === "yesterday" && "Ayer"}
                    {filter === "thisWeek" && "Esta semana"}
                    {filter === "thisMonth" && "Este mes"}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoadingOrders ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          onRowClick={handleEdit}
          emptyMessage="No hay pedidos"
        />
      )}

    </AppLayout>
  );
};

export default Orders;
