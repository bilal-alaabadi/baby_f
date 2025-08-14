// components/OrderSummary.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const OrderSummary = ({ onClose }) => {
  const dispatch = useDispatch();
  const { products, totalPrice, shippingFee, country } = useSelector((store) => store.cart);
  
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;
  
  const grandTotal = (totalPrice + shippingFee) * exchangeRate;
  const formattedTotalPrice = (totalPrice * exchangeRate).toFixed(2);
  const formattedShippingFee = (shippingFee * exchangeRate).toFixed(2);
  const formattedGrandTotal = grandTotal.toFixed(2);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const renderCustomizationDetails = (item) => {
    if (!item.customization) return null;
    
    return (
      <div className="mt-2 text-sm text-gray-100">
        {item.customization.length && <p>الطول: {item.customization.length} سم</p>}
        {item.customization.width && <p>العرض: {item.customization.width} سم</p>}
        {item.customization.sleeveType && <p>نوع الأكمام: {item.customization.sleeveType}</p>}
        {item.customization.closureType && <p>نوع الإغلاق: {item.customization.closureType}</p>}
        {item.customization.color && <p>اللون: {item.customization.color}</p>}
        {item.customization.notes && <p>ملاحظات: {item.customization.notes}</p>}
      </div>
    );
  };

  return (
    <div className='bg-[#758d64] mt-5 rounded text-base' >
      <div className='px-6 py-4 space-y-5'>
        <h2 className='text-xl text-white'>ملخص الطلب</h2>
        
        <div className="text-white space-y-4">
          {products.map((item, index) => (
            <div key={index} className="border-b pb-3">
              <p>{item.name} × {item.quantity}</p>
              {item.customization && renderCustomizationDetails(item)}
              <p className="text-sm mt-1">السعر: {(item.price * exchangeRate * item.quantity).toFixed(2)} {currency}</p>
            </div>
          ))}
        </div>
        
        <div className='text-white'>
          <p>السعر الفرعي: {formattedTotalPrice} {currency}</p>
          <p>رسوم الشحن: {formattedShippingFee} {currency}</p>
          <p className='font-bold mt-2'>الإجمالي النهائي: {formattedGrandTotal} {currency}</p>
        </div>
        
        <div className='px-4 mb-6'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearCart();
            }}
            className='bg-red-500 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center mb-4 hover:bg-red-600 transition-colors'
          >
            <span className='mr-2'>تفريغ السلة</span>
            <i className="ri-delete-bin-7-line"></i>
          </button>
          <Link to="/checkout">
            <button
              onClick={onClose}
              className='bg-green-600 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center hover:bg-green-700 transition-colors '
            >
              <span className='mr-2'>إتمام الشراء</span>
              <i className="ri-bank-card-line"></i>
            </button>
          </Link>
        </div>
      </div>
    </div> 
  );
};

export default OrderSummary;
