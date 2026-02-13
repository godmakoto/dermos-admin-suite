import { BottomNav } from "./BottomNav";
import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Package, label: "Productos", path: "/products" },
  { icon: ShoppingCart, label: "Pedidos", path: "/orders" },
  { icon: Settings, label: "Ajustes", path: "/settings" },
];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-56 lg:flex-col lg:border-r lg:border-border lg:bg-background">
        {/* Logo */}
        <div className="flex h-14 items-center px-5 border-b border-border">
          <span className="text-base font-semibold text-foreground">DermoAdmin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-1",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-56">
        {/* Content with padding for bottom nav on mobile */}
        <div className="min-h-screen pb-20 lg:pb-0">
          <div className="px-4 py-4 lg:px-6 lg:py-6">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
