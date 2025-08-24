import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PaymentLogin = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(name, password, 'payment')) { // Specify 'payment' role for this login page
      navigate("/payment/home");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-green-300">
        <CardHeader className="text-center bg-green-500 text-white rounded-t-lg py-6">
          <CardTitle className="text-3xl font-extrabold">পেমেন্ট লগইন</CardTitle>
          <CardDescription className="text-green-100">
            আপনার ইউজার নেম এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-lg font-semibold text-gray-700">
                ইউজার নেম (নাম)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Rafiqul Islam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 p-3 border-green-300 focus:border-green-500 focus:ring-green-500"
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
                className="mt-2 p-3 border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white text-lg py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              লগইন করুন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentLogin;