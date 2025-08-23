import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import VoucherEntry from "./pages/VoucherEntry";
import SelectedVouchers from "./pages/SelectedVouchers";
import Cart from "./pages/Cart";
import MentorApproval from "./pages/MentorApproval";
import MentorVoucherDetails from "./pages/MentorVoucherDetails"; // New import
import Payment from "./pages/Payment";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FinalCheckApproval from "./pages/FinalCheckApproval";
import Report from "./pages/Report";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SubmittedVouchersProvider } from "./context/SubmittedVouchersContext";
import Layout from "./components/layout/Layout";
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
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
                
                {/* Protected Routes wrapped by Layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/voucher-entry" element={<VoucherEntry />} />
                    <Route path="/selected-vouchers" element={<SelectedVouchers />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/mentor-approval" element={<MentorApproval />} />
                    <Route path="/mentor-approval/:userPin" element={<MentorVoucherDetails />} /> {/* New Route */}
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/final-check-approval" element={<FinalCheckApproval />} />
                    <Route path="/report" element={<Report />} />
                  </Route>
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