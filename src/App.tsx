import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import VoucherEntry from "./pages/VoucherEntry";
import SelectedVouchers from "./pages/SelectedVouchers"; // Will create this next
import Cart from "./pages/Cart"; // Will create this next
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/layout/Header";
import ProtectedRoute from "./components/ProtectedRoute"; // Will create this next

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Header /> {/* Header will be visible on all pages */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/voucher-entry" element={<VoucherEntry />} />
              <Route path="/selected-vouchers" element={<SelectedVouchers />} />
              <Route path="/cart" element={<Cart />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;