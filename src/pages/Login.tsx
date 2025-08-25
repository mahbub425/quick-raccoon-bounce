import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password, 'user')) {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-blue-300">
        <CardHeader className="text-center bg-blue-500 text-white rounded-t-lg py-6">
          <CardTitle className="text-3xl font-extrabold">ইউজার লগইন</CardTitle>
          <CardDescription className="text-blue-100">
            আপনার ইউজার নেম এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-lg font-semibold text-gray-700">
                ইউজার নেম
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="আপনার ইউজার নেম লিখুন"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 p-3 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-lg font-semibold text-gray-700">
                পাসওয়ার্ড
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 p-3 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white text-lg py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              লগইন করুন
            </Button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-700 font-semibold text-lg">অন্যান্য পোর্টালে লগইন করুন:</p>
            <div className="flex flex-col space-y-2">
              <Link to="/mentor-login" className="text-purple-600 hover:text-purple-800 underline text-base">
                মেন্টর লগইন
              </Link>
              <Link to="/payment-login" className="text-green-600 hover:text-green-800 underline text-base">
                পেমেন্ট লগইন
              </Link>
              <Link to="/audit-login" className="text-orange-600 hover:text-orange-800 underline text-base">
                ফাইনাল চেক ও অ্যাপ্রুভাল লগইন
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;