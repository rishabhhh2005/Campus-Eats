// src/context/CartContext.jsx
import React, { createContext, useContext, useState } from "react";
import AlertDialog from "../components/AlertDialog";
import OrderConfirmDialog from "../components/OrderConfirmDialog";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  // Initialize cart from localStorage if available, otherwise empty.
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('ce_cart');
      return raw ? JSON.parse(raw) : { outlet: null, items: [] };
    } catch (e) {
      return { outlet: null, items: [] };
    }
  });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, menuItem: null, outlet: null });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Add item to cart (adds 1 or adds new item)
  const addItem = (menuItem, outlet) => {
    if (cart.outlet && cart.outlet !== outlet.slug) {
      setAlertDialog({ isOpen: true, menuItem, outlet });
      return;
    }

    setCart(prev => {
      const outletSlug = outlet.slug;
      const existing = prev.items.find(i => i.id === menuItem.id);
      if (existing) {
        return {
          ...prev,
          outlet: outletSlug,
          items: prev.items.map(i =>
            i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      } else {
        const newItem = {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          qty: 1,
          image: menuItem.image,
        };
        return { outlet: outletSlug, items: [...prev.items, newItem] };
      }
    });
  };

  // Change item quantity by delta (can be negative)
  const changeItemQty = (menuItem, outlet, qtyChange) => {
    if (cart.outlet && cart.outlet !== outlet.slug) {
      setAlertDialog({ isOpen: true, menuItem, outlet });
      return;
    }

    setCart(prev => {
      const outletSlug = outlet.slug;
      const existingIndex = prev.items.findIndex(i => i.id === menuItem.id);
      let newItems = [...prev.items];

      if (existingIndex === -1) {
        // If no item found and qtyChange > 0, add new item
        if (qtyChange > 0) {
          newItems.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            qty: qtyChange,
            image: menuItem.image,
          });
        }
      } else {
        // Update qty of existing item
        const existingItem = newItems[existingIndex];
        const updatedQty = existingItem.qty + qtyChange;

        if (updatedQty <= 0) {
          // Remove item if qty zero or less
          newItems.splice(existingIndex, 1);
        } else {
          newItems[existingIndex] = { ...existingItem, qty: updatedQty };
        }
      }

      return { outlet: newItems.length ? outletSlug : null, items: newItems };
    });
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCart(prev => {
      const items = prev.items.filter(i => i.id !== id);
      return { outlet: items.length ? prev.outlet : null, items };
    });
  };

  // Update item quantity directly
  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setCart(prev => ({
      ...prev,
      items: prev.items.map(i => (i.id === id ? { ...i, qty } : i)),
    }));
  };

  // Clear the cart
  const clearCart = () => setCart({ outlet: null, items: [] });

  // Confirm alert dialog for cross-outlet
  const handleAlertConfirm = () => {
    const { menuItem, outlet } = alertDialog;
    setCart({ outlet: outlet.slug, items: [] });
    setAlertDialog({ isOpen: false, menuItem: null, outlet: null });

    setCart({
      outlet: outlet.slug,
      items: [{
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        qty: 1,
        image: menuItem.image,
      }],
    });
  };

  const handleAlertCancel = () => {
    setAlertDialog({ isOpen: false, menuItem: null, outlet: null });
  };

  // Handle order confirmation
  const placeOrder = () => {
    setConfirmDialogOpen(true);
  };

  const confirmPlaceOrder = () => {
    clearCart();
    setConfirmDialogOpen(false);
  };

  const cancelPlaceOrder = () => {
    setConfirmDialogOpen(false);
  };

  // Total cart value
  const total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Persist cart to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('ce_cart', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        changeItemQty, // <-- Expose changeItemQty for add/subtract buttons
        removeItem,
        updateQty,
        clearCart,
        total,
        placeOrder,
      }}
    >
      <AlertDialog
        isOpen={alertDialog.isOpen}
        message="Your cart contains items from another outlet. Clear cart and add this item?"
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
      />

      <OrderConfirmDialog
        isOpen={confirmDialogOpen}
        onConfirm={confirmPlaceOrder}
        onCancel={cancelPlaceOrder}
      />

      {children}
    </CartContext.Provider>
  );
}
