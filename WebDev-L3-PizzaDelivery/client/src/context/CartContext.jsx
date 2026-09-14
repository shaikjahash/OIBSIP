import { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

// Each cart line: { id, pizzaId?, name, base, sauce, cheese, vegetables[], quantity, unitPrice }
export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);

  function addLine(line) {
    setLines((prev) => [...prev, { ...line, id: crypto.randomUUID() }]);
  }

  function removeLine(id) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function updateQuantity(id, quantity) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, quantity) } : l)));
  }

  function clearCart() {
    setLines([]);
  }

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    [lines]
  );

  return (
    <CartContext.Provider value={{ lines, addLine, removeLine, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
