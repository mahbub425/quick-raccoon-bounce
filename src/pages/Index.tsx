import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'mentor') {
        navigate("/mentor/home");
      } else if (user.role === 'payment') {
        navigate("/payment/home");
      } else if (user.role === 'audit') {
        navigate("/audit/home");
      } else {
        navigate("/home"); // Default for 'user' role
      }
    } else {
      navigate("/login"); // Default login for unauthenticated users
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
};

export default Index;