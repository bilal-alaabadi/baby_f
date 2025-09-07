import { createSlice } from "@reduxjs/toolkit";

// استعادة الحالة من localStorage إن وجدت
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('cartState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const initialState = loadState() || {
  products: [],
  selectedItems: 0,
  totalPrice: 0,
  shippingFee: 2, // لم يعد يُستخدم للحساب؛ يترك للتوافق
  country: 'عمان',
};

const clampToStock = (qty, stock) => {
  if (typeof stock !== 'number' || Number.isNaN(stock) || stock <= 0) return Math.max(0, qty);
  return Math.min(qty, stock);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const incoming = action.payload;
      const id = incoming._id;
      const stock = typeof incoming.stock === 'number' ? incoming.stock : undefined;

      const existing = state.products.find((p) => p._id === id);
      if (existing) {
        const desired = existing.quantity + 1;
        existing.quantity = clampToStock(desired, existing.stock ?? stock);
      } else {
        const initialQty = clampToStock(1, stock);
        state.products.push({
          ...incoming,
          stock, // خزّن المخزون مع العنصر
          quantity: initialQty,
          ...(incoming.customization && { customization: incoming.customization }),
        });
      }

      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    updateQuantity: (state, action) => {
      const { id, type } = action.payload;
      const product = state.products.find((p) => p._id === id);
      if (product) {
        if (type === 'increment') {
          const desired = product.quantity + 1;
          product.quantity = clampToStock(desired, product.stock);
        } else if (type === 'decrement') {
          product.quantity = Math.max(1, product.quantity - 1);
        }
      }
      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    removeFromCart: (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload.id);
      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    clearCart: (state) => {
      state.products = [];
      state.selectedItems = 0;
      state.totalPrice = 0;
      saveState(state);
    },

    setCountry: (state, action) => {
      state.country = action.payload;
      // shippingFee ثابت قديم للتوافق؛ الحساب الفعلي يتم عند العرض/الدفع
      state.shippingFee = action.payload === 'الإمارات' ? 4 : 2;
      saveState(state);
    },

    // في حال أردت تحميل الحالة من الخادم مستقبلاً
    loadCart: (state, action) => action.payload,
  },
});

// دوال حفظ وحساب
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('cartState', serializedState);
  } catch (err) {
    console.error("Failed to save cart state:", err);
  }
};

export const setSelectedItems = (state) =>
  state.products.reduce((total, product) => total + product.quantity, 0);

export const setTotalPrice = (state) =>
  state.products.reduce(
    (total, product) => total + (product.quantity * product.price),
    0
  );

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCountry,
  loadCart
} = cartSlice.actions;

export default cartSlice.reducer;
