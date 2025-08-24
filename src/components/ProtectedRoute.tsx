import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/types";

interface ProtectedRouteProps {
  requiredRole?: UserProfile['role'];
  redirectTo?: string;
}

const ProtectedRoute = ({ requiredRole, redirectTo = "/login" }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    // If not authenticated, redirect to the specified login page
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If authenticated but role doesn't match, redirect to their respective home page
    // or a generic unauthorized page.
    let userHomePath = "/home";
    if (user.role === 'mentor') userHomePath = "/mentor/home";
    else if (user.role === 'payment') userHomePath = "/payment/home";
    else if (user.role === 'audit') userHomePath = "/audit/home";
    
    // Prevent infinite redirects if already on the wrong home page
    if (window.location.pathname !== userHomePath) {
      return <Navigate to={userHomePath} replace />;
    }
    // If already on their home page but tried to access another role's protected route,
    // just render the outlet (which might be a NotFound or their own dashboard).
    // Or, you could show an "Unauthorized" message. For now, let's just render outlet.
  }

  return <Outlet />;
};

export default ProtectedRoute;