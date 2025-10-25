// ========================= src/redux/features/cart/cartSlice.js =========================
import { createSlice } from "@reduxjs/toolkit";

/* ===================== أدوات التخزين ===================== */
const loadStateRaw = () => {
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

/* ===================== دوال مساعدة مشتركة ===================== */
const numOrNull = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
const posNumOrNull = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : null);

const buildVariantKey = (obj) => {
  const id = obj?._id ?? obj?.id ?? '';
  const color = (obj?.chosenColor || obj?.color || '').toString().trim().toLowerCase();
  const size = (obj?.chosenSize || obj?.size || '').toString().trim().toLowerCase();
  const optionLabel = (obj?.chosenOption?.label || obj?.optionLabel || '').toString().trim().toLowerCase();
  const chosenCount = (obj?.chosenCount || '').toString().trim().toLowerCase();
  return [id, color, size, optionLabel, chosenCount].join('|');
};

// فعلي = maxStock → min(colorStock, chosenOption.stock/optionStock) → أحدهما → stock → null
const getEffectiveStock = (item) => {
  const maxS = numOrNull(item?.maxStock);
  if (maxS != null) return Math.max(0, maxS);

  const cS = numOrNull(item?.colorStock);
  const optS = numOrNull(item?.chosenOption?.stock) ?? numOrNull(item?.optionStock);

  if (cS != null && optS != null) return Math.max(0, Math.min(cS, optS));
  if (cS != null) return Math.max(0, cS);
  if (optS != null) return Math.max(0, optS);

  const base = numOrNull(item?.stock);
  return base != null ? Math.max(0, base) : null;
};

// المحجوز افتراضياً لنفس المتغير (مع إمكانية استثناء اندكس)
const getReservedQtyForVariant = (products, payloadLike, excludeIndex = -1) => {
  const key = buildVariantKey(payloadLike);
  return products.reduce((sum, p, i) => {
    if (i === excludeIndex) return sum;
    return buildVariantKey(p) === key ? sum + (Number(p.quantity) || 0) : sum;
  }, 0);
};

// حد الكمية المتاح للسطر الحالي = المخزون الفعلي - محجوز السطور السابقة من نفس المتغير
const getAllowedMaxForIndex = (products, index) => {
  const item = products[index];
  const stock = getEffectiveStock(item);
  if (!Number.isFinite(stock)) return Infinity;
  // احسب المحجوز من العناصر السابقة فقط (لثبات القرار عبر المرور التسلسلي)
  const reservedBefore = products.slice(0, index).reduce((sum, p, i) => {
    return buildVariantKey(p) === buildVariantKey(item) ? sum + (Number(p.quantity) || 0) : sum;
  }, 0);
  return Math.max(0, stock - reservedBefore);
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// دمج عناصر متطابقة المفتاح (نجمع الكميات)
const mergeByVariantKey = (products) => {
  const map = new Map();
  for (const p of products) {
    const key = buildVariantKey(p);
    if (!map.has(key)) {
      map.set(key, { ...p });
    } else {
      const exist = map.get(key);
      map.set(key, { ...exist, quantity: (Number(exist.quantity) || 0) + (Number(p.quantity) || 0) });
    }
  }
  return Array.from(map.values());
};

// تنظيف/ترقية عنصر (توحيد الأرقام + ترحيل مخزون الخيار إلى chosenOption.stock إن لزم)
const normalizeItem = (item) => {
  const out = { ...item };

  out.price = Number(out.price) || 0;

  const s = posNumOrNull(out.stock);
  const cs = posNumOrNull(out.colorStock);
  const os = posNumOrNull(out.optionStock);
  const ms = posNumOrNull(out.maxStock);
  if (s != null) out.stock = s;
  if (cs != null) out.colorStock = cs;
  if (os != null) out.optionStock = os;
  if (ms != null) out.maxStock = ms;

  if (out.chosenOption) {
    out.chosenOption = {
      label: out.chosenOption.label,
      price: Number(out.chosenOption.price) || 0,
      ...(posNumOrNull(out.chosenOption.stock) != null ? { stock: posNumOrNull(out.chosenOption.stock) } : {}),
    };
    // إن لم يوجد chosenOption.stock لكن يوجد optionStock على مستوى العنصر، نرحله
    if (out.chosenOption.stock == null && os != null) {
      out.chosenOption.stock = os;
    }
  }

  out.quantity = Math.max(1, Number(out.quantity) || 1);
  return out;
};

// يعيد حساب جميع العناصر بترتيبها: يدمج المتطابق، يقيّد الكميات حسب “المتبقي بعد الحجز”، ويزيل الصفوف التي تصبح 0
const recomputeAndClampAll = (state) => {
  // 1) دمج العناصر المتطابقة
  let items = mergeByVariantKey(state.products.map(normalizeItem));

  // 2) ترتيب ثابت (اختياري): حسب وقت الإضافة (الموجود بالفعل)
  // 3) مرّ على كل عنصر وقيّد كميته بما لا يتجاوز المتاح بعد طرح المحجوز من السابقين
  items = items.map((p) => normalizeItem(p));
  for (let i = 0; i < items.length; i++) {
    const allowedMax = getAllowedMaxForIndex(items, i);
    items[i].quantity = clamp(Number(items[i].quantity) || 1, 1, Number.isFinite(allowedMax) ? allowedMax : Number(items[i].quantity) || 1);
  }

  // 4) إزالة العناصر التي صارت 0 (لو وُجدت)
  items = items.filter((p) => (Number(p.quantity) || 0) > 0);

  state.products = items;
};

/* ===================== الحالة الابتدائية ===================== */
const initState = (() => {
  const loaded = loadStateRaw();
  const base = {
    products: [],
    selectedItems: 0,
    totalPrice: 0,
    shippingFee: 2,
    country: 'عُمان',
  };
  const state = { ...base, ...(loaded || {}) };

  // تنظيف/ترقية + تقييد الكميات عند بدء التشغيل
  recomputeAndClampAll(state);
  state.selectedItems = state.products.reduce((t, p) => t + (Number(p.quantity) || 0), 0);
  state.totalPrice = state.products.reduce((t, p) => t + ((Number(p.quantity) || 0) * (Number(p.price) || 0)), 0);
  saveState(state);
  return state;
})();

/* ===================== حسابات عامة ===================== */
export const setSelectedItems = (state) =>
  state.products.reduce((total, product) => total + (Number(product.quantity) || 0), 0);

export const setTotalPrice = (state) =>
  state.products.reduce(
    (total, product) => total + ((Number(product.quantity) || 0) * (Number(product.price) || 0)),
    0
  );

/* ===================== السلايس ===================== */
const cartSlice = createSlice({
  name: "cart",
  initialState: initState,
  reducers: {
    addToCart: (state, action) => {
      const incoming = normalizeItem(action.payload || {});
      const idx = state.products.findIndex((p) => buildVariantKey(p) === buildVariantKey(incoming));

      if (idx !== -1) {
        // اجمع الكمية مؤقتاً ثم أعد الحساب الشامل
        state.products[idx].quantity = (Number(state.products[idx].quantity) || 0) + (Number(incoming.quantity) || 1);
        // حدّث الحقول (قد تتغيّر)
        state.products[idx] = normalizeItem({ ...state.products[idx], ...incoming });
      } else {
        state.products.push(incoming);
      }

      // أعد الحساب + التقييد بعد الإضافة
      recomputeAndClampAll(state);
      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    updateQuantity: (state, action) => {
      const { id, type, chosenColor, chosenSize, optionLabel, chosenCount } = action.payload || {};
      const keyPayload = { _id: id, chosenColor, chosenSize, optionLabel, chosenCount };
      const idx = state.products.findIndex((p) => buildVariantKey(p) === buildVariantKey(keyPayload));
      if (idx === -1) return;

      if (type === 'increment') {
        state.products[idx].quantity = (Number(state.products[idx].quantity) || 0) + 1;
      } else if (type === 'decrement') {
        state.products[idx].quantity = Math.max(1, (Number(state.products[idx].quantity) || 1) - 1);
      }

      // تقييد شامل بعد التعديل
      recomputeAndClampAll(state);
      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    removeFromCart: (state, action) => {
      const { id, chosenColor, chosenSize, optionLabel, chosenCount } = action.payload || {};
      const keyPayload = { _id: id, chosenColor, chosenSize, optionLabel, chosenCount };
      const key = buildVariantKey(keyPayload);

      state.products = state.products.filter((p) => buildVariantKey(p) !== key);

      // حذف شامل عند عدم تمرير متغيرات
      if (!chosenColor && !chosenSize && !optionLabel && !chosenCount) {
        state.products = state.products.filter((p) => p._id !== id);
      }

      // تقييد شامل
      recomputeAndClampAll(state);
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
      state.shippingFee = action.payload === 'الإمارات' ? 4 : 2;
      saveState(state);
    },

    // تحميل سلة من الخارج (إن استخدمتها) مع تنظيف وتقييد
    loadCart: (state, action) => {
      const next = { ...(action.payload || {}) };
      next.products = Array.isArray(next.products) ? next.products.map(normalizeItem) : [];
      state.products = next.products;
      state.country = next.country || state.country;
      state.shippingFee = Number.isFinite(next.shippingFee) ? next.shippingFee : state.shippingFee;

      recomputeAndClampAll(state);
      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },
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
