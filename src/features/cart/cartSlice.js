import { createSlice } from '@reduxjs/toolkit';

/**
 * Cart Redux slice.
 * Cart is local state — one cart per kitchen at a time.
 * If a user adds items from a different kitchen, they must clear the existing cart first.
 */

const initialState = {
  kitchenId: null,
  kitchenName: '',
  items: [], // { foodId, name, price, quantity, image, isVeg, maxQuantity }
  isOpen: false, // cart drawer open/closed
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { kitchenId, kitchenName, food } = action.payload;

      // If switching kitchen, reset cart
      if (state.kitchenId && state.kitchenId !== kitchenId) {
        state.items = [];
      }

      state.kitchenId = kitchenId;
      state.kitchenName = kitchenName;

      const existing = state.items.find((i) => i.foodId === food._id);

      if (existing) {
        // Increment (respect maxQuantity)
        if (existing.quantity < existing.maxQuantity) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({
          foodId: food._id,
          name: food.name,
          price: food.price,
          quantity: 1,
          image: food.image || '',
          isVeg: food.isVeg,
          maxQuantity: food.availableQuantity || 99,
        });
      }

      state.isOpen = true;
    },

    updateQuantity(state, action) {
      const { foodId, quantity } = action.payload;
      const item = state.items.find((i) => i.foodId === foodId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.foodId !== foodId);
        } else {
          item.quantity = Math.min(quantity, item.maxQuantity);
        }
      }

      // If cart is empty, reset
      if (state.items.length === 0) {
        state.kitchenId = null;
        state.kitchenName = '';
      }
    },

    removeFromCart(state, action) {
      const foodId = action.payload;
      state.items = state.items.filter((i) => i.foodId !== foodId);

      if (state.items.length === 0) {
        state.kitchenId = null;
        state.kitchenName = '';
      }
    },

    clearCart(state) {
      state.kitchenId = null;
      state.kitchenName = '';
      state.items = [];
      state.isOpen = false;
    },

    toggleCartDrawer(state) {
      state.isOpen = !state.isOpen;
    },

    setCartOpen(state, action) {
      state.isOpen = action.payload;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  toggleCartDrawer,
  setCartOpen,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartKitchenId = (state) => state.cart.kitchenId;
export const selectCartKitchenName = (state) => state.cart.kitchenName;
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectIsCartOpen = (state) => state.cart.isOpen;

export default cartSlice.reducer;
