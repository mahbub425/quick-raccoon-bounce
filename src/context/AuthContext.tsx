import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { UserProfile } from "@/types";
import { DUMMY_USERS } from "@/data/dummyData";
import { toast } from "sonner";

interface AuthContextType {
  user: UserProfile | null;
  login: (username: string, password: string, requiredRole?: UserProfile['role']) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "currentUser"; // Key for storing user in localStorage

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Load user from localStorage on initial load
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  // Save user to localStorage whenever the user state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    }
  }, [user]);

  const login = (username: string, password: string, requiredRole?: UserProfile['role']): boolean => {
    const foundUser = DUMMY_USERS.find(
      (u) => u.username === username && u.password === password,
    );

    if (foundUser) {
      if (requiredRole && foundUser.role !== requiredRole) {
        toast.error(`এই পোর্টালে লগইন করার অনুমতি নেই।`);
        return false;
      }
      setUser(foundUser);
      toast.success("লগইন সফল হয়েছে!");
      return true;
    }
    toast.error("ভুল ইউজার নেম বা পাসওয়ার্ড।");
    return false;
  };

  const logout = () => {
    setUser(null);
    toast.info("লগআউট সফল হয়েছে।");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};