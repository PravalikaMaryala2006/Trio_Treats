import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_treats_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_treats_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionId] = useState(() => {
    let s = localStorage.getItem('trio_treats_session_id');
    if (!s) {
      s = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('trio_treats_session_id', s);
    }
    return s;
  });

  const syncTimeoutRef = useRef(null);

  // Subtotal calculation
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

  // Delivery fee calculation: Free above ₹300, else ₹40 (or 0 if cart empty)
  const deliveryFee = items.length === 0 ? 0 : (subtotal >= 300 ? 0 : 40);

  // Discount calculation
  let discount = 0;
  if (coupon && coupon.discount) {
    discount = Math.min(coupon.discount, subtotal);
  }

  const total = Math.max(0, subtotal - discount + deliveryFee);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('trio_treats_cart', JSON.stringify(items));
    if (coupon) {
      localStorage.setItem('trio_treats_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('trio_treats_coupon');
    }
  }, [items, coupon]);

  // Sync with backend (Live Cart monitoring for Admin)
  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post('/cart/sync', {
          items,
          subtotal,
          discount,
          couponApplied: coupon?.code || '',
          deliveryFee,
          total,
          sessionId,
          status: items.length > 0 ? 'active' : 'empty',
          guestInfo: user ? null : {
            name: 'Guest Customer',
            phone: 'Pending checkout'
          }
        });
      } catch (err) {
        // quiet fallback
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(syncTimeoutRef.current);
  }, [items, subtotal, discount, coupon, total, user, sessionId]);

  // Add product to cart
  const addToCart = (product, quantity = 1, customNotes = '', boxSelections = null) => {
    setItems(prevItems => {
      // For custom boxes or items with custom notes, keep them distinct
      const existingIndex = prevItems.findIndex(item =>
        item.productId === (product._id || product.id) &&
        (!boxSelections || JSON.stringify(item.boxSelections) === JSON.stringify(boxSelections)) &&
        (!customNotes || item.customNotes === customNotes)
      );

      if (existingIndex > -1 && !boxSelections) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            productId: product._id || product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            weight: product.weight,
            quantity: Math.max(1, quantity),
            customNotes,
            boxSelections
          }
        ];
      }
    });
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity, itemIndex = null) => {
    setItems(prev => {
      if (itemIndex !== null && prev[itemIndex]) {
        if (newQuantity <= 0) {
          return prev.filter((_, idx) => idx !== itemIndex);
        }
        const updated = [...prev];
        updated[itemIndex].quantity = newQuantity;
        return updated;
      }

      if (newQuantity <= 0) {
        return prev.filter(i => i.productId !== productId);
      }
      return prev.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // Remove item
  const removeFromCart = (productId, itemIndex = null) => {
    setItems(prev => {
      if (itemIndex !== null) {
        return prev.filter((_, idx) => idx !== itemIndex);
      }
      return prev.filter(i => i.productId !== productId);
    });
  };

  // Apply Coupon
  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotal,
        mobile: user?.mobile
      });

      if (res.valid) {
        setCoupon({
          code: res.code,
          discount: res.discount,
          message: res.message
        });
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid coupon code' };
    }
  };

  // Remove Coupon
  const removeCoupon = () => {
    setCoupon(null);
  };

  // Clear cart after checkout
  const clearCart = async () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('trio_treats_cart');
    localStorage.removeItem('trio_treats_coupon');
    try {
      await api.post('/cart/clear', { sessionId });
    } catch {}
  };

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        subtotal,
        deliveryFee,
        discount,
        coupon,
        total,
        sessionId,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
