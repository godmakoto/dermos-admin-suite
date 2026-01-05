import { Sidebar } from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

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
        {/* Header with toggle button when collapsed */}
        {isCollapsed && (
          <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background px-4">
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
