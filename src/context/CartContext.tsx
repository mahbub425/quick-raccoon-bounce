import React, { createContext, useState, useContext, ReactNode, useMemo } from "react";
import { CartItem } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'createdAt'>) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, updatedData: any) => void;
  clearCart: () => void;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'id' | 'createdAt'>) => {
    const newItem: CartItem = {
      ...item,
      id: Date.now().toString(), // Simple unique ID for now
      createdAt: new Date().toISOString(),
    };
    setCartItems((prev) => [...prev, newItem]);
    toast.success(`${item.voucherHeading} কার্টে যোগ করা হয়েছে!`);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("আইটেম কার্ট থেকে মুছে ফেলা হয়েছে।");
  };

  const updateCartItem = (id: string, updatedData: any) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, data: { ...item.data, ...updatedData } } : item,
      ),
    );
    toast.success("কার্ট আইটেম আপডেট করা হয়েছে!");
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info("কার্ট খালি করা হয়েছে।");
  };

  const cartItemCount = useMemo(() => cartItems.length, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};