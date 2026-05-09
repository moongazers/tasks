import { createContext, useContext, useState, type ReactNode } from "react";
import { addToCart } from "../api/shop";

interface CartContextType {
  count: number;
  addItem: (skuId: string, quantity: number) => Promise<{ remainingStock: number }>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const addItem = async (skuId: string, quantity: number) => {
    const result = await addToCart(skuId, quantity);
    setCount(result.cartCount);
    return { remainingStock: result.remainingStock };
  };

  return (
    <CartContext.Provider value={{ count, addItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
