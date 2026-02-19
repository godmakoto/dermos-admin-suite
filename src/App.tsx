import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Orders from "./pages/Orders";
import OrderForm from "./pages/OrderForm";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  const scrollPositions = useRef<Record<string, number>>({});
  const prevSectionRef = useRef<string>('');

  // Continuously track scroll position in memory while on each page
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[pathname] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  // On route change: restore scroll only when returning from a form within the same section
  useEffect(() => {
    const currentSection = pathname.split('/')[1] || '';
    const prevSection = prevSectionRef.current;
    const isFormPage = /\/(new|.+\/edit)$/.test(pathname);
    const sectionChanged = prevSection !== '' && prevSection !== currentSection;

    if (isFormPage || sectionChanged) {
      window.scrollTo(0, 0);
      if (sectionChanged) {
        delete scrollPositions.current[pathname];
      }
    } else {
      const savedY = scrollPositions.current[pathname];
      if (savedY != null && savedY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedY);
        });
      }
    }

    prevSectionRef.current = currentSection;
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/new"
                  element={
                    <ProtectedRoute>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/:id/edit"
                  element={
                    <ProtectedRoute>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/new"
                  element={
                    <ProtectedRoute>
                      <OrderForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id/edit"
                  element={
                    <ProtectedRoute>
                      <OrderForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
