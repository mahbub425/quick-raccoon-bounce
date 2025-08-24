import React, { createContext, useState, useContext, ReactNode } from "react";
import { UserProfile } from "@/types";
import { DUMMY_USERS } from "@/data/dummyData";
import { toast } from "sonner";

interface AuthContextType {
  user: UserProfile | null;
  login: (name: string, password: string, requiredRole?: UserProfile['role']) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = (name: string, password: string, requiredRole?: UserProfile['role']): boolean => {
    const foundUser = DUMMY_USERS.find(
      (u) => u.name === name && u.password === password,
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