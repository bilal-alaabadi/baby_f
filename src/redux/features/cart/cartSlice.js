// ========================= src/redux/features/cart/cartSlice.js =========================
import { createSlice } from "@reduxjs/toolkit";

/* ===================== أدوات التخزين ===================== */
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('cartState');
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('cartState', serializedState);
  } catch (err) {
    console.error("Failed to save cart state:", err);
  }
};

/* ===================== الحالة الابتدائية ===================== */
const initialState = loadState() || {
  products: [],
  selectedItems: 0,
  totalPrice: 0,
  shippingFee: 2, // للتوافق فقط
  country: 'عُمان', // توحيد الكتابة مع الواجهة
};

/* ===================== دوال مساعدة ===================== */
// مفتاح تمييز المتغير (variant) لتفريق نفس المنتج بألوان/مقاسات/عدد مختلفة
const buildVariantKey = (obj) => {
  const id = obj._id ?? obj.id ?? '';
  const color = (obj.chosenColor || obj.color || '').toString().trim().toLowerCase();
  const size = (obj.chosenSize || obj.size || '').toString().trim().toLowerCase();
  const optionLabel = (obj.chosenOption?.label || obj.optionLabel || '').toString().trim().toLowerCase();
  const chosenCount = (obj.chosenCount || '').toString().trim().toLowerCase();
  return [id, color, size, optionLabel, chosenCount].join('|');
};

// يختار المخزون الفعّال: مخزون الخيار إن وُجد وإلا مخزون المنتج
const getEffectiveStock = (productLike) => {
  const optStock = productLike?.chosenOption?.stock;
  if (Number.isFinite(optStock)) return Math.max(0, Number(optStock));
  const s = productLike?.stock;
  return Number.isFinite(s) ? Math.max(0, Number(s)) : undefined;
};

const clampToStock = (qty, stock) => {
  if (!Number.isFinite(stock) || stock <= 0) return Math.max(0, qty);
  return Math.min(qty, stock);
};

// مطابقة عنصر في السلة بحسب المتغيرات أو الرجوع للـ id فقط كحل أخير للتوافق
const findProductIndex = (state, payload) => {
  // حاول أولاً بالمفتاح الكامل
  const key = buildVariantKey(payload);
  let idx = state.products.findIndex((p) => buildVariantKey(p) === key);
  if (idx !== -1) return idx;

  // توافق قديم: مطابقة أول عنصر بنفس الـ id (عند عدم تمرير المتغيرات)
  const id = payload._id ?? payload.id;
  if (id == null) return -1;
  idx = state.products.findIndex((p) => p._id === id);
  return idx;
};

/* ===================== حسابات عامة ===================== */
export const setSelectedItems = (state) =>
  state.products.reduce((total, product) => total + product.quantity, 0);

export const setTotalPrice = (state) =>
  state.products.reduce(
    (total, product) => total + (product.quantity * (Number(product.price) || 0)),
    0
  );

/* ===================== السلايس ===================== */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const incoming = action.payload || {};
      // اجعل الكمية القادمة محترمة إن أرسلت، وإلا 1
      const incomingQty = Math.max(1, Number(incoming.quantity) || 1);

      const idx = findProductIndex(state, incoming);
      const effectiveStockIncoming = getEffectiveStock(incoming);

      if (idx !== -1) {
        // عنصر بنفس المتغير موجود: زد الكمية
        const existing = state.products[idx];
        const effectiveStockExisting = getEffectiveStock(existing);
        const targetStock = Number.isFinite(effectiveStockExisting)
          ? effectiveStockExisting
          : effectiveStockIncoming;
        const desired = existing.quantity + incomingQty;
        existing.quantity = clampToStock(desired, targetStock);
      } else {
        // عنصر جديد: خزّن كل حقول المتغيرات كما هي
        const initialQty = clampToStock(incomingQty, effectiveStockIncoming);
        state.products.push({
          ...incoming,
          // ثبّت قيم العرض الهامة
          price: Number(incoming.price) || 0,
          stock: Number.isFinite(incoming.stock) ? Number(incoming.stock) : incoming.stock,
          quantity: initialQty,
          // حافظ على chosenOption و chosenCount و اللون والمقاس كما أرسلها المكوّن
          chosenOption: incoming.chosenOption || undefined,
          chosenCount: incoming.chosenCount || undefined,
          chosenColor: incoming.chosenColor || incoming.color || undefined,
          chosenSize: incoming.chosenSize || incoming.size || undefined,
          ...(incoming.customization && { customization: incoming.customization }),
        });
      }

      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    updateQuantity: (state, action) => {
      const { id, type, chosenColor, chosenSize, optionLabel, chosenCount } = action.payload || {};
      const payloadKeyObj = { _id: id, chosenColor, chosenSize, optionLabel, chosenCount };
      const idx = findProductIndex(state, payloadKeyObj);
      if (idx === -1) return;

      const product = state.products[idx];
      const stock = getEffectiveStock(product);

      if (type === 'increment') {
        const desired = product.quantity + 1;
        product.quantity = clampToStock(desired, stock);
      } else if (type === 'decrement') {
        product.quantity = Math.max(1, product.quantity - 1);
      }

      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    removeFromCart: (state, action) => {
      const { id, chosenColor, chosenSize, optionLabel, chosenCount } = action.payload || {};
      const payloadKeyObj = { _id: id, chosenColor, chosenSize, optionLabel, chosenCount };
      const key = buildVariantKey(payloadKeyObj);

      // احذف فقط العنصر المطابق تمامًا للمتغير
      state.products = state.products.filter((p) => buildVariantKey(p) !== key);

      // توافق قديم: إذا لم تُمرر مفاتيح المتغيرات نهائيًا وكان الحذف بالـ id فقط
      if (!chosenColor && !chosenSize && !optionLabel && !chosenCount) {
        // في حال لم يُحذف شيء بالمفتاح، احذف جميع العناصر بالـ id (سلوك سابق)
        if (state.products.some((p) => p._id === id)) {
          state.products = state.products.filter((p) => p._id !== id);
        }
      }

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
      // shippingFee قديم للتوافق؛ الحساب الحقيقي خارج السلايس
      state.shippingFee = action.payload === 'الإمارات' ? 4 : 2;
      saveState(state);
    },

    loadCart: (state, action) => action.payload,
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCountry,
  loadCart
} = cartSlice.actions;

export default cartSlice.reducer;
