import { Sidebar } from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          isCollapsed ? "ml-0" : "ml-64"
        )}
      >
        {/* Header with toggle button when collapsed */}
        {isCollapsed && (
          <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background px-4">
            <button
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <PanelLeft className="h-4 w-4 text-primary-foreground" />
            </button>
            <span className="ml-3 text-lg font-semibold text-foreground">DermoAdmin</span>
          </div>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
