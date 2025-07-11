import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error.status)) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Global3DBackground maxHeight="100vh" />
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
