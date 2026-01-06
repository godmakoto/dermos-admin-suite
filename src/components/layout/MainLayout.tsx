import { Sidebar } from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Mock user data - en el futuro esto vendrá de autenticación
const mockUser = {
  name: "Admin Usuario",
  email: "admin@dermoadmin.com",
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <Sidebar />
      
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          // En desktop: margen cuando sidebar abierto
          // En móvil: siempre sin margen (sidebar se superpone)
          isCollapsed ? "ml-0" : "lg:ml-64 ml-0"
        )}
      >
        {/* Header móvil siempre visible */}
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background px-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4 text-primary-foreground" />
          </button>
          
          {/* Mostrar usuario cuando sidebar abierto, título cuando cerrado */}
          {!isCollapsed ? (
            <div className="ml-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground leading-tight">{mockUser.name}</span>
                <span className="text-xs text-muted-foreground leading-tight">{mockUser.email}</span>
              </div>
            </div>
          ) : (
            <span className="ml-3 text-lg font-semibold text-foreground">DermoAdmin</span>
          )}
        </div>

        {/* Header desktop cuando sidebar colapsado */}
        {isCollapsed && (
          <div className="sticky top-0 z-30 hidden lg:flex h-16 items-center border-b border-border bg-background px-4">
            <button
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Menu className="h-4 w-4 text-primary-foreground" />
            </button>
            <span className="ml-3 text-lg font-semibold text-foreground">DermoAdmin</span>
          </div>
        )}

        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};
