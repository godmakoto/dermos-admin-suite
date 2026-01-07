import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Package, label: "Productos", path: "/products" },
  { icon: ShoppingCart, label: "Pedidos", path: "/orders" },
  { icon: Settings, label: "Ajustes", path: "/settings" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-[11px]",
                isActive ? "font-medium" : "font-normal"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
