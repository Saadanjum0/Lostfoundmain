import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ItemDetail from "./pages/ItemDetail";
import Messages from "./pages/Messages";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Lost from "./pages/report/Lost";
import Found from "./pages/report/Found";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminItems from "./pages/admin/AdminItems";
import AdminItemDetail from "./pages/admin/AdminItemDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPending from "./pages/admin/AdminPending";
import AuthGuard from "./components/AuthGuard";
import AuthCallback from "./pages/auth/AuthCallback";
import Global3DBackground from "./components/Global3DBackground";
import HowItWorks from "./pages/HowItWorks";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import ItemsLost from "./pages/ItemsLost";
import ItemsFound from "./pages/ItemsFound";
import React, { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except for 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error.status)) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
  },
});

// Route transition wrapper to prevent navigation glitches
const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Prevent navigation glitches on mobile
    const preventFlash = () => {
      const elements = [document.documentElement, document.body, document.getElementById('root')];
      elements.forEach(el => {
        if (el) {
          el.style.background = 'radial-gradient(ellipse at center, #1a1a1a 0%, #141414 30%, #0f0f0f 70%, #0a0a0a 100%)';
          el.style.backgroundColor = '#0a0a0a';
          el.style.transition = 'none';
        }
      });
    };

    preventFlash();

    // Additional prevention on route change
    const timer = setTimeout(preventFlash, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return <div style={{ background: 'transparent', minHeight: '100vh' }}>{children}</div>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Global3DBackground maxHeight="100vh" />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/items/browse" element={<Browse />} />
              <Route path="/items/lost" element={<ItemsLost />} />
              <Route path="/items/found" element={<ItemsFound />} />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/report/lost" element={<AuthGuard><Lost /></AuthGuard>} />
              <Route path="/report/found" element={<AuthGuard><Found /></AuthGuard>} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/pending" element={<AdminPending />} />
              <Route path="/admin/items" element={<AdminItems />} />
              <Route path="/admin/items/:id" element={<AdminItemDetail />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
