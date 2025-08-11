import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RiBankCardLine } from "react-icons/ri";
import { getBaseUrl } from '../../utils/baseURL';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilayat, setWilayat] = useState('');
  const [description, setDescription] = useState('');

  const { products, totalPrice, country } = useSelector((state) => state.cart);
  const { user } = useSelector(state => state.auth);

  // سعر الشحن الأساسي بالريال العماني
  const baseShippingFee = country === 'الإمارات'? 0.1 : 0.1;

  // العملة وسعر الصرف حسب البلد
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  const shippingFee = baseShippingFee * exchangeRate;

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (products.length === 0) {
      setError("لا توجد منتجات في السلة. الرجاء إضافة منتجات قبل المتابعة إلى الدفع.");
    } else {
      setError('');
    }
  }, [user, products, navigate]);

  const makePayment = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (products.length === 0) {
      setError("لا توجد منتجات في السلة. الرجاء إضافة منتجات قبل المتابعة إلى الدفع.");
      return;
    }

    if (!customerName || !customerPhone || !country || !wilayat) {
      setError("الرجاء إدخال جميع المعلومات المطلوبة (الاسم، رقم الهاتف، البلد، العنوان)");
      return;
    }

    const body = {
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        image: Array.isArray(product.image) ? product.image[0] : product.image
      })),
      customerName,
      customerPhone,
      country,
      wilayat,
      description,
      email: user?.email
    };

    try {
      const response = await fetch(`${getBaseUrl()}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const session = await response.json();

      if (session.paymentLink) {
        window.location.href = session.paymentLink;
      } else {
        setError("حدث خطأ أثناء إنشاء رابط الدفع. الرجاء المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setError(error.message || "حدث خطأ أثناء عملية الدفع. الرجاء المحاولة مرة أخرى.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* تفاصيل الفاتورة */}
      <div className="flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">تفاصيل الفاتورة</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <form onSubmit={makePayment} className="space-y-4 md:space-y-6" dir="rtl">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                className="w-full p-2 border rounded-md"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">البلد</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-gray-100"
                value={country}
                readOnly
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">العنوان</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={wilayat}
                onChange={(e) => setWilayat(e.target.value)}
                required
                placeholder="الرجاء إدخال العنوان كاملاً"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">وصف إضافي (اختياري)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أي ملاحظات أو تفاصيل إضافية عن الطلب"
                rows="3"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#799b52] text-white px-6 py-3 rounded-md w-full"
            disabled={products.length === 0}
          >
            إتمام الطلب
          </button>
        </form>
      </div>

      {/* تفاصيل الطلب */}
      <div className="w-full md:w-1/3 p-4 md:p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">طلبك</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">{product.name} × {product.quantity}</span>
              <span className="text-gray-900 font-medium">
                {(product.price * product.quantity * exchangeRate).toFixed(2)} {currency}
              </span>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-800">رسوم الشحن</span>
            <p className="text-gray-900">{currency}{shippingFee.toFixed(2)}</p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-gray-800 font-semibold">الإجمالي</span>
            <p className="text-gray-900 font-bold">
              {currency}{((totalPrice + baseShippingFee) * exchangeRate).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">دفع ثواني</h3>
          <button
            onClick={makePayment}
            className="w-full bg-[#799b52] text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
            disabled={products.length === 0}
          >
            <RiBankCardLine className="text-xl" />
            <span>الدفع باستخدام ثواني</span>
          </button>
          <p className="mt-4 text-sm text-gray-600">
            سيتم استخدام بياناتك الشخصية لمعالجة طلبك، ودعم تجربتك عبر هذا الموقع، ولأغراض أخرى موضحة في{" "}
            <a className="text-blue-600 hover:underline">سياسة الخصوصية</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
