import React from 'react';
import { RiCloseLine } from "react-icons/ri";
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/features/cart/cartSlice';
import OrderSummary from './OrderSummary';

const CartModal = ({ products, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { totalPrice, country } = useSelector((state) => state.cart);
  
  // تحديد العملة ورسوم الشحن حسب الدولة
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;
  const shippingFee = country === 'الإمارات' ? 4 : 2;

  const formatPrice = (price) => {
    return (price * exchangeRate).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* طبقة التعتيم */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* اللوحة المنزلِقة من اليمين */}
      <aside
        className={[
          "absolute right-0 top-0 h-full bg-white shadow-xl",
          "w-full sm:w-[90%] md:w-[80%] max-w-5xl",
          "transform transition-transform duration-300 ease-out",
          "translate-x-0" // بما أننا نُركّبها فقط عند isOpen=true
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
              {products.map((product) => (
                <div key={product._id} className="flex justify-between items-center border-b border-gray-100 py-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={Array.isArray(product.image) ? product.image[0] : product.image} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64'; }}
                    />
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-gray-600">{formatPrice(product.price)} {currency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => dispatch(updateQuantity({ id: product._id, type: 'decrement' }))}
                      className="w-8 h-8 flex items-center justify-center border rounded"
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span>{product.quantity}</span>
                    <button 
                      onClick={() => dispatch(updateQuantity({ id: product._id, type: 'increment' }))}
                      className="w-8 h-8 flex items-center justify-center border rounded"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => dispatch(removeFromCart({ id: product._id }))}
                      className="text-red-500 hover:text-red-700"
                      aria-label="إزالة المنتج"
                    >
                      <RiCloseLine size={18} />
                    </button>
                  </div>
                </div>
              ))}

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
