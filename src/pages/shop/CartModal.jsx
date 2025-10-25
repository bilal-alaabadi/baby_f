// ========================= src/components/cart/CartModal.jsx =========================
import React from 'react';
import { RiCloseLine } from "react-icons/ri";
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/features/cart/cartSlice';
import OrderSummary from './OrderSummary';

const buildVariantKey = (obj) => {
  const id = obj._id ?? obj.id ?? '';
  const color = (obj.chosenColor || obj.color || '').toString().trim().toLowerCase();
  const size = (obj.chosenSize || obj.size || '').toString().trim().toLowerCase();
  const optionLabel = (obj.chosenOption?.label || obj.optionLabel || '').toString().trim().toLowerCase();
  const chosenCount = (obj.chosenCount || '').toString().trim().toLowerCase();
  return [id, color, size, optionLabel, chosenCount].join('|');
};

const numOrNull = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
const getEffectiveStock = (p) => {
  const ms = numOrNull(p?.maxStock);
  if (ms != null) return Math.max(0, ms);
  const cs = numOrNull(p?.colorStock);
  const os = numOrNull(p?.chosenOption?.stock) ?? numOrNull(p?.optionStock);
  if (cs != null && os != null) return Math.max(0, Math.min(cs, os));
  if (cs != null) return Math.max(0, cs);
  if (os != null) return Math.max(0, os);
  const base = numOrNull(p?.stock);
  return base != null ? Math.max(0, base) : null;
};

const getReservedFromOthers = (all, index) => {
  const key = buildVariantKey(all[index]);
  return all.reduce((sum, p, i) => (i !== index && buildVariantKey(p) === key ? sum + (Number(p.quantity) || 0) : sum), 0);
};

const CartModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { country, products: cartProducts = [] } = useSelector((state) => state.cart);

  const isAEDCountry = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAEDCountry ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAEDCountry ? 9.5 : 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" dir="rtl">
      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* درج السلة */}
      <aside
        className="absolute right-0 top-0 h-full w-[90vw] max-w-sm bg-white shadow-2xl rounded-l-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* العنوان */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 id="cart-title" className="text-lg font-bold text-gray-900">
            سلة التسوق
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded p-1 transition"
            aria-label="إغلاق"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {cartProducts.length === 0 ? (
            <p className="text-center text-gray-600 py-10">
              سلة التسوق فارغة
            </p>
          ) : (
            cartProducts.map((product, i) => {
              const displayPrice = (Number(product.price || 0) * exchangeRate).toFixed(2);
              const mainImage = Array.isArray(product.image) ? product.image[0] : product.image;

              const chosenColor = product.chosenColor || product.color || '';
              const chosenSize  = product.chosenSize  || product.size  || '';
              const optionLabel = product.chosenOption?.label || '';
              const chosenCount = product.chosenCount || '';

              const stock = getEffectiveStock(product);
              const reservedFromOthers = getReservedFromOthers(cartProducts, i);
              const allowedMax = Number.isFinite(stock) ? Math.max(0, stock - reservedFromOthers) : Infinity;
              const canIncrement = (Number(product.quantity) || 0) < allowedMax;

              return (
                <div key={`${product._id || i}-${chosenColor}-${chosenSize}-${optionLabel}-${chosenCount}`} className="pb-5 border-b">
                  <div className="flex gap-3 flex-row-reverse">
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-16 h-24 object-cover flex-shrink-0 rounded"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80x120?text=Image'; }}
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-5 line-clamp-2">
                            {product.name}
                          </p>

                          {(chosenColor || chosenSize || optionLabel) && (
                            <div className="mt-1 text-[11px] text-gray-600 flex flex-wrap gap-1.5">
                              {chosenColor && <span className="px-2 py-0.5 rounded-full border bg-gray-50">اللون: {chosenColor}</span>}
                              {chosenSize  && <span className="px-2 py-0.5 rounded-full border bg-gray-50">المقاس: {chosenSize}</span>}
                              {optionLabel && <span className="px-2 py-0.5 rounded-full border bg-gray-50">عدد القطع: {optionLabel}</span>}
                            </div>
                          )}

                          {/* المتوفر لهذا السطر بعد الحجز من الآخرين */}
                          {Number.isFinite(stock) && (
                            <p className={`mt-1 text-[11px] ${allowedMax <= 0 ? 'text-red-600' : 'text-lime-700'}`}>
                              المتوفر: {Math.max(0, Number.isFinite(stock) ? (stock - reservedFromOthers) : 0)}
                            </p>
                          )}
                        </div>

                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {displayPrice} {currency}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => dispatch(removeFromCart({ id: product._id, chosenColor, chosenSize, optionLabel, chosenCount }))}
                          className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
                        >
                          إزالة
                        </button>

                        <div className="inline-flex items-center border rounded-lg overflow-hidden">
                          <button
                            onClick={() => dispatch(updateQuantity({ id: product._id, type: 'decrement', chosenColor, chosenSize, optionLabel, chosenCount }))}
                            className="px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                            aria-label="إنقاص الكمية"
                          >
                            −
                          </button>
                          <span className="px-3 py-1.5 text-gray-900" aria-live="polite">
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (canIncrement) {
                                dispatch(updateQuantity({ id: product._id, type: 'increment', chosenColor, chosenSize, optionLabel, chosenCount }));
                              }
                            }}
                            className={`px-3 py-1.5 text-gray-700 ${canIncrement ? 'hover:bg-gray-50' : 'opacity-40 cursor-not-allowed'}`}
                            aria-label="زيادة الكمية"
                            disabled={!canIncrement}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* الملخص */}
        <div className="border-t px-5 py-4 bg-white">
          <OrderSummary onClose={onClose} />
        </div>
      </aside>
    </div>
  );
};

export default CartModal;
