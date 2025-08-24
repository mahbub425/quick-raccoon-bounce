import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const MentorLogin = () => {
  const [username, setUsername] = useState(""); // Changed state variable to username
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password, 'mentor')) { // Pass username to login function
      navigate("/mentor/home"); // Redirect to mentor's home page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-purple-300">
        <CardHeader className="text-center bg-purple-500 text-white rounded-t-lg py-6">
          <CardTitle className="text-3xl font-extrabold">মেন্টর লগইন</CardTitle>
          <CardDescription className="text-purple-100">
            আপনার ইউজার নেম এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-lg font-semibold text-gray-700"> {/* Changed htmlFor to username */}
                ইউজার নেম
              </Label>
              <Input
                id="username" // Changed id to username
                type="text"
                placeholder="আপনার ইউজার নেম লিখুন" // Updated placeholder
                value={username}
                onChange={(e) => setUsername(e.target.value)} // Updated onChange
                required
                className="mt-2 p-3 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
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
                className="mt-2 p-3 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white text-lg py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              লগইন করুন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorLogin;