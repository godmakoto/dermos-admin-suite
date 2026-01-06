import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock user data - en el futuro esto vendrá de autenticación
const mockUser = {
  email: "admin@tienda.com",
};

const navItems = [
  { icon: Package, label: "Productos", path: "/products" },
  { icon: ShoppingCart, label: "Pedidos", path: "/orders" },
  { icon: Settings, label: "Configuración", path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  const handleNavClick = () => {
    // Cerrar sidebar en móvil/tablet al hacer clic en un link
    if (window.innerWidth < 1024 && !isCollapsed) {
      toggleSidebar();
    }
  };

  // En móvil/tablet: mostrar email + X; en desktop: hamburguesa + título
  const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-0" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header del drawer - diferente para móvil/tablet vs desktop */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {/* Móvil/Tablet: email a la izquierda, X a la derecha */}
          <div className="lg:hidden flex w-full items-center justify-between">
            <span className="text-sm text-muted-foreground truncate">{mockUser.email}</span>
            <button
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>
          
          {/* Desktop: hamburguesa + título */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Menu className="h-4 w-4 text-primary-foreground" />
            </button>
            <span className="text-lg font-semibold text-foreground whitespace-nowrap">DermoAdmin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground whitespace-nowrap">Panel de Administración</p>
          <p className="text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};
