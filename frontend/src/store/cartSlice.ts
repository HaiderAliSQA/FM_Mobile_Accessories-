// frontend/src/store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../types';

const CART_STORAGE_KEY = 'km_cart';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { productId, size, color, quantity, price } = action.payload;
      const numPrice = Number(price);
      const numQuantity = Number(quantity);

      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += numQuantity;
      } else {
        state.items.push({
          ...action.payload,
          price: numPrice,
          quantity: numQuantity,
        });
      }

      saveCartToStorage(state.items);
    },

    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; size?: number; color?: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.size === action.payload.size &&
            item.color === action.payload.color
          )
      );
      saveCartToStorage(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; size?: number; color?: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              !(
                i.productId === action.payload.productId &&
                i.size === action.payload.size &&
                i.color === action.payload.color
              )
          );
        } else {
          item.quantity = action.payload.quantity;
        }
        saveCartToStorage(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }): CartItem[] =>
  state.cart.items;

export const selectCartItemCount = (state: { cart: CartState }): number =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: { cart: CartState }): number =>
  state.cart.items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

export const selectCartDelivery = (_state: { cart: CartState }): number => 300;

export const selectCartTotal = (state: { cart: CartState }): number =>
  Number(selectCartSubtotal(state)) + Number(selectCartDelivery(state));

export const selectCartIsOpen = (state: { cart: CartState }): boolean =>
  state.cart.isOpen;

export default cartSlice.reducer;
