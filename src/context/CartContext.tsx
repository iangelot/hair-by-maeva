"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ServiceItem } from "@/data/services";

export interface CartItem {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  deposit: number;
  selectedLength?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (service: ServiceItem, selectedLength?: string, addPrice?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalDeposit: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("beas_braids_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore error
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem("beas_braids_cart", JSON.stringify(items));
    } catch {
      // Ignore error
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (service: ServiceItem, selectedLength?: string, addPrice: number = 0) => {
    const finalPrice = service.price + addPrice;
    const itemId = `${service.id}-${selectedLength || "standard"}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          serviceId: service.id,
          name: service.name,
          price: finalPrice,
          deposit: service.deposit,
          selectedLength,
          quantity: 1,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDeposit = items.reduce((sum, item) => sum + item.deposit * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        totalDeposit,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
