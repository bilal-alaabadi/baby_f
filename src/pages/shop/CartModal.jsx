import React from 'react';
import { RiCloseLine } from "react-icons/ri";
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/features/cart/cartSlice';
import OrderSummary from './OrderSummary';

const CartModal = ({ products, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { country } = useSelector((state) => state.cart);
  
  // العملة والتحويل للعرض فقط
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  const formatPrice = (price) => (price * exchangeRate).toFixed(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* طبقة التعتيم */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* اللوحة المنزلِقة من اليمين */}
      <aside
        className={[
          "absolute right-0 top-0 h-full bg-white shadow-xl",
          "w-full sm:w-[90%] md:w-[80%] max-w-5xl",
          "transform transition-transform duration-300 ease-out",
          "translate-x-0"
        ].join(" ")}
        dir="rtl"
        aria-label="سلة التسوق"
      >
        {/* هيدر اللوحة */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[var(--brand)]">سلة التسوق</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* محتوى اللوحة */}
        <div className="p-4 space-y-4">
          {products.length === 0 ? (
            <p className="text-center py-8">سلة التسوق فارغة</p>
          ) : (
            <>
              {products.map((product) => {
                const imgSrc = Array.isArray(product.image) ? product.image[0] : product.image;
                const chosenColor = product.chosenColor || product.color || '';
                const chosenSize  = product.chosenSize  || product.size  || '';

                return (
                  <div key={product._id + (chosenColor || '') + (chosenSize || '')} className="flex justify-between items-center border-b border-gray-100 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={imgSrc}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64'; }}
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>

                        {/* تفاصيل اللون/المقاس */}
                        {(chosenColor || chosenSize) && (
                          <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                            {chosenColor && (
                              <span className="px-2 py-0.5 rounded-full border bg-gray-50">
                                اللون: {chosenColor}
                              </span>
                            )}
                            {chosenSize && (
                              <span className="px-2 py-0.5 rounded-full border bg-gray-50">
                                المقاس: {chosenSize}
                              </span>
                            )}
                          </div>
                        )}

                        {/* سعر الوحدة */}
                        <p className="text-gray-700 mt-1">
                          {formatPrice(product.price)} {currency} <span className="text-xs text-gray-500">(سعر الوحدة)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => dispatch(updateQuantity({ id: product._id, type: 'decrement', chosenColor, chosenSize }))}
                        className="w-8 h-8 flex items-center justify-center border rounded"
                        aria-label="تقليل الكمية"
                      >
                        -
                      </button>
                      <span>{product.quantity}</span>
                      <button 
                        onClick={() => dispatch(updateQuantity({ id: product._id, type: 'increment', chosenColor, chosenSize }))}
                        className="w-8 h-8 flex items-center justify-center border rounded"
                        aria-label="زيادة الكمية"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => dispatch(removeFromCart({ id: product._id, chosenColor, chosenSize }))}
                        className="text-red-500 hover:text-red-700"
                        aria-label="إزالة المنتج"
                      >
                        <RiCloseLine size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* الملخص داخل اللوحة */}
              {products.length > 0 && <OrderSummary onClose={onClose} />}
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CartModal;
