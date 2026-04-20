// frontend/src/hooks/useCart.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartTotal,
  selectCartDelivery,
  selectCartIsOpen,
} from '../store/cartSlice';
import { CartItem } from '../types';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartItemCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const total = useAppSelector(selectCartTotal);
  const deliveryCharges = useAppSelector(selectCartDelivery);
  const isOpen = useAppSelector(selectCartIsOpen);

  const handleAddToCart = useCallback((item: CartItem) => {
    dispatch(addToCart(item));
    dispatch(openCart());
  }, [dispatch]);

  const handleRemoveFromCart = useCallback((productId: string, size?: number, color?: string) => {
    dispatch(removeFromCart({ productId, size, color }));
  }, [dispatch]);

  const handleUpdateQuantity = useCallback((productId: string, size: number | undefined, color: string | undefined, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeFromCart({ productId, size, color }));
    } else {
      dispatch(updateQuantity({ productId, size, color, quantity }));
    }
  }, [dispatch]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const handleToggleCart = useCallback(() => {
    dispatch(toggleCart());
  }, [dispatch]);

  return {
    items,
    count,
    subtotal,
    total,
    deliveryCharges,
    isOpen,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    toggleCart: handleToggleCart,
    openCart: () => dispatch(openCart()),
    closeCart: () => dispatch(closeCart()),
  };
};
