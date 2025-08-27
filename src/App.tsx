import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import MentorLogin from "./pages/MentorLogin";
import PaymentLogin from "./pages/PaymentLogin";
import AuditLogin from "./pages/AuditLogin";
import VoucherEntry from "./pages/VoucherEntry";
import SelectedVouchers from "./pages/SelectedVouchers";
import Cart from "./pages/Cart";
import MentorApproval from "./pages/MentorApproval";
import MentorVoucherDetails from "./pages/MentorVoucherDetails";
import Payment from "./pages/Payment";
import MakePayment from "./pages/MakePayment";
import Receive from "./pages/Receive";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FinalCheckApproval from "./pages/FinalCheckApproval";
import Report from "./pages/Report";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SubmittedVouchersProvider } from "./context/SubmittedVouchersContext";
import { NotificationProvider } from "./context/NotificationContext"; // Import NotificationProvider
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProfile } from "./types";

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
              <NotificationProvider> {/* Wrap with NotificationProvider */}
                <Routes>
                  {/* Public Login Routes - Renamed to avoid conflicts */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/mentor-login" element={<MentorLogin />} />
                  <Route path="/payment-login" element={<PaymentLogin />} />
                  <Route path="/audit-login" element={<AuditLogin />} />
                  
                  {/* Initial redirect based on login status */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Protected Routes for 'user' role */}
                  <Route element={<ProtectedRoute requiredRole="user" redirectTo="/login" />}>
                    <Route element={<Layout />}>
                      <Route path="/home" element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/voucher-entry" element={<VoucherEntry />} />
                      <Route path="/selected-vouchers" element={<SelectedVouchers />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/report" element={<Report />} />
                    </Route>
                  </Route>

                  {/* Protected Routes for 'mentor' role */}
                  <Route element={<ProtectedRoute requiredRole="mentor" redirectTo="/mentor-login" />}>
                    <Route element={<Layout />}>
                      <Route path="/mentor/home" element={<Home />} />
                      <Route path="/mentor/dashboard" element={<Dashboard />} />
                      <Route path="/mentor/voucher-entry" element={<VoucherEntry />} />
                      <Route path="/mentor/selected-vouchers" element={<SelectedVouchers />} />
                      <Route path="/mentor/cart" element={<Cart />} />
                      <Route path="/mentor-approval" element={<MentorApproval />} />
                      <Route path="/mentor-approval/:userPin" element={<MentorVoucherDetails />} />
                      <Route path="/mentor/report" element={<Report />} />
                      <Route path="/mentor/payment" element={<Payment />} />
                    </Route>
                  </Route>

                  {/* Protected Routes for 'payment' role */}
                  <Route element={<ProtectedRoute requiredRole="payment" redirectTo="/payment-login" />}>
                    <Route element={<Layout />}>
                      <Route path="/payment/home" element={<Home />} />
                      <Route path="/payment/dashboard" element={<Dashboard />} />
                      <Route path="/payment/voucher-entry" element={<VoucherEntry />} />
                      <Route path="/payment/selected-vouchers" element={<SelectedVouchers />} />
                      <Route path="/payment/cart" element={<Cart />} />
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/payment/make-payment" element={<MakePayment />} />
                      <Route path="/payment/receive" element={<Receive />} />
                      <Route path="/payment/report" element={<Report />} />
                    </Route>
                  </Route>

                  {/* Protected Routes for 'audit' role */}
                  <Route element={<ProtectedRoute requiredRole="audit" redirectTo="/audit-login" />}>
                    <Route element={<Layout />}>
                      <Route path="/audit/home" element={<Home />} />
                      <Route path="/audit/dashboard" element={<Dashboard />} />
                      <Route path="/audit/voucher-entry" element={<VoucherEntry />} />
                      <Route path="/audit/selected-vouchers" element={<SelectedVouchers />} />
                      <Route path="/audit/cart" element={<Cart />} />
                      <Route path="/final-check-approval" element={<FinalCheckApproval />} />
                      <Route path="/audit/report" element={<Report />} />
                    </Route>
                  </Route>

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NotificationProvider>
            </SubmittedVouchersProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;