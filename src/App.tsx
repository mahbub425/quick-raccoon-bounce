import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import VoucherEntry from "./pages/VoucherEntry";
import SelectedVouchers from "./pages/SelectedVouchers";
import Cart from "./pages/Cart";
import MentorApproval from "./pages/MentorApproval";
import Payment from "./pages/Payment";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SubmittedVouchersProvider } from "./context/SubmittedVouchersContext";
import Header from "./components/layout/Header";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <SubmittedVouchersProvider>
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/voucher-entry" element={<VoucherEntry />} />
                  <Route path="/selected-vouchers" element={<SelectedVouchers />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/mentor-approval" element={<MentorApproval />} />
                  <Route path="/payment" element={<Payment />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SubmittedVouchersProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;