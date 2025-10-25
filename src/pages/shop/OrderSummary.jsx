// ========================= src/components/cart/OrderSummary.jsx =========================
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, updateQuantity, removeFromCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

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

// محجوز من السطور الأُخرى لنفس المتغير
const getReservedFromOthers = (all, index) => {
  const key = buildVariantKey(all[index]);
  return all.reduce((sum, p, i) => (i !== index && buildVariantKey(p) === key ? sum + (Number(p.quantity) || 0) : sum), 0);
};

const OrderSummary = ({ onClose }) => {
  const dispatch = useDispatch();
  const { products, totalPrice, country } = useSelector((store) => store.cart);

  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  const subtotalOMR = Number(totalPrice) || 0;
  const shippingFeeOMR = subtotalOMR < 10 ? 2 : (subtotalOMR <= 20 ? 1 : 0);

  const formattedSubtotal = (subtotalOMR * exchangeRate).toFixed(2);
  const formattedShipping = (shippingFeeOMR * exchangeRate).toFixed(2);
  const formattedGrand = ((subtotalOMR + shippingFeeOMR) * exchangeRate).toFixed(2);

  const incentives = useMemo(() => {
    const toCheaper = subtotalOMR < 10 ? (10 - subtotalOMR) : 0;
    const toFree = subtotalOMR < 20 ? (20 - subtotalOMR) : 0;

    return {
      toCheaper,
      toFree,
      toCheaperDisplay: (toCheaper * exchangeRate).toFixed(2),
      toFreeDisplay: (toFree * exchangeRate).toFixed(2),
      progressToFree: Math.max(0, Math.min(100, Math.round((subtotalOMR / 20) * 100))),
    };
  }, [subtotalOMR, exchangeRate]);

  const handleClearCart = () => dispatch(clearCart());

  const dec = (id, chosenColor, chosenSize, optionLabel, chosenCount) =>
    dispatch(updateQuantity({ id, type: 'decrement', chosenColor, chosenSize, optionLabel, chosenCount }));

  const inc = (id, chosenColor, chosenSize, optionLabel, chosenCount) =>
    dispatch(updateQuantity({ id, type: 'increment', chosenColor, chosenSize, optionLabel, chosenCount }));

  const remove = (id, chosenColor, chosenSize, optionLabel, chosenCount) =>
    dispatch(removeFromCart({ id, chosenColor, chosenSize, optionLabel, chosenCount }));

  return (
    <div className="bg-white mt-5 rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-5 space-y-5" dir="rtl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">ملخص الطلب</h2>
          <span className="text-sm text-gray-500">
            عناصر السلة: {products.reduce((a, b) => a + (Number(b.quantity) || 0), 0)}
          </span>
        </div>

        {/* التحفيز */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-amber-100 to-emerald-100 border border-[#92B0B0]">
          {subtotalOMR < 20 ? (
            <>
              {subtotalOMR < 10 ? (
                <p className="text-emerald-900 text-sm md:text-base">
                  أضِف <span className="font-semibold">{incentives.toCheaperDisplay} {currency}</span> لتحصل على
                  شحن أرخص <span className="font-semibold">1 ر.ع</span> فقط.
                </p>
              ) : (
                <p className="text-emerald-900 text-sm md:text-base">
                  رائع! الشحن الآن <span className="font-semibold">1 ر.ع</span>.
                  أضِف <span className="font-semibold">{incentives.toFreeDisplay} {currency}</span> لتحصل على
                  <span className="font-semibold"> شحن مجاني</span>.
                </p>
              )}

              <div className="mt-3">
                <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden border border-emerald-300">
                  <div className="h-2 bg-emerald-500" style={{ width: `${incentives.progressToFree}%` }} />
                </div>
                <div className="flex justify-between text-[12px] text-emerald-800 mt-1">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-emerald-900 text-sm md:text-base">🎉 مبروك! حصلت على <span className="font-semibold">شحن مجاني</span>.</p>
          )}
        </div>

        {/* عناصر السلة */}
        <div className="space-y-4">
          {products.map((item, index) => {
            const chosenColor = item.chosenColor || item.color || '';
            const chosenSize  = item.chosenSize  || item.size  || '';
            const optionLabel = item.chosenOption?.label || '';
            const chosenCount = item.chosenCount || '';

            const stock = getEffectiveStock(item);
            const reservedFromOthers = getReservedFromOthers(products, index);
            const allowedMax = Number.isFinite(stock) ? Math.max(0, stock - reservedFromOthers) : null;

            const outOfStock = allowedMax === 0;
            const atMax = Number.isFinite(allowedMax) && (Number(item.quantity) || 0) >= allowedMax;

            const imgSrc = Array.isArray(item.image) ? item.image[0] : item.image;

            // return (
            //   <div key={item._id + (chosenColor || '') + (chosenSize || '') + (optionLabel || '') + (chosenCount || '')} className="border rounded-lg p-3 md:p-4 shadow-sm bg-white">
            //     <div className="flex items-start gap-3">
            //       <img
            //         src={imgSrc}
            //         alt={item.name}
            //         className="w-16 h-16 object-cover rounded-md border"
            //         onError={(e) => { e.target.src = 'https://via.placeholder.com/64'; }}
            //       />
            //       <div className="flex-1">
            //         <div className="flex items-center justify-between gap-3">
            //           <h3 className="font-semibold text-gray-800">{item.name}</h3>
            //           <button
            //             onClick={() => remove(item._id, chosenColor, chosenSize, optionLabel, chosenCount)}
            //             className="text-red-500 hover:text-red-600 text-sm"
            //             title="حذف المنتج"
            //           >
            //             إزالة
            //           </button>
            //         </div>

            //         {/* حالة المخزون (بعد الحجز الافتراضي) */}
            //         <div className="mt-2">
            //           {allowedMax === null ? (
            //             <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600 border">
            //               المتوفر: غير محدد
            //             </span>
            //           ) : outOfStock ? (
            //             <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
            //               غير متوفر حالياً
            //             </span>
            //           ) : atMax ? (
            //             <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            //               وصلت للكمية المتاحة ({allowedMax})
            //             </span>
            //           ) : (
            //             <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            //               المتوفر: {allowedMax}
            //             </span>
            //           )}
            //         </div>

            //         {/* أزرار +/- (إن رغبت فعلها) */}
            //         <div className="mt-2 flex items-center gap-2">
            //           <button
            //             onClick={() => dispatch(updateQuantity({ id: item._id, type: 'decrement', chosenColor, chosenSize, optionLabel, chosenCount }))}
            //             className="w-8 h-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            //             disabled={(Number(item.quantity)||0) <= 1}
            //             title="تقليل الكمية"
            //           >
            //             –
            //           </button>
            //           <span className="px-3 py-1 rounded bg-gray-50 border text-gray-800">{item.quantity}</span>
            //           <button
            //             onClick={() => dispatch(updateQuantity({ id: item._id, type: 'increment', chosenColor, chosenSize, optionLabel, chosenCount }))}
            //             className={`w-8 h-8 rounded-md border ${
            //               atMax || outOfStock
            //                 ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            //                 : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            //             }`}
            //             disabled={atMax || outOfStock}
            //             title={atMax ? 'بلغت الحد المتاح من المخزون' : 'زيادة الكمية'}
            //           >
            //             +
            //           </button>
            //         </div>
            //       </div>
            //     </div>
            //   </div>
            // );
          })}
        </div>

        {/* الإجماليات */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex justify-between text-gray-700">
            <span>السعر الفرعي</span>
            <span className="font-medium">{formattedSubtotal} {currency}</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-1">
            <span>رسوم الشحن</span>
            <span className="font-medium">{formattedShipping} {currency}</span>
          </div>
          <div className="flex justify-between text-gray-900 mt-3 border-t pt-3">
            <span className="font-semibold">الإجمالي النهائي</span>
            <span className="font-bold">{formattedGrand} {currency}</span>
          </div>
        </div>

        {/* أزرار */}
        <div className="px-1 mb-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleClearCart(); }}
            className="w-full bg-red-500 px-3 py-2 text-white mt-2 rounded-md flex justify-center items-center gap-2 hover:bg-red-600 transition-colors"
          >
            <i className="ri-delete-bin-7-line" />
            <span>تفريغ السلة</span>
          </button>

          <Link to="/checkout" onClick={onClose}>
            <button className="w-full bg-emerald-600 px-3 py-2 text-white mt-3 rounded-md flex justify-center items-center gap-2 hover:bg-emerald-700 transition-colors">
              <i className="ri-bank-card-line" />
              <span>إتمام الشراء</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
