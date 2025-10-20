// ========================= src/components/products/SingleProduct.jsx =========================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import ReviewsCard from '../reviews/ReviewsCard';

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { data, error, isLoading } = useFetchProductByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { country } = useSelector((state) => state.cart);

  const singleProduct = data?.product ?? data ?? null;
  const productReviews = singleProduct?.reviews || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // كمية الإضافة للسلة
  const [selectedQty, setSelectedQty] = useState(1);

  // خيارات الألوان
  const colors = Array.isArray(singleProduct?.colors) ? singleProduct.colors : [];
  const hasColors = colors.length > 0;
  const [selectedColor, setSelectedColor] = useState('');

  // خيارات countPrices
  const countPrices = Array.isArray(singleProduct?.countPrices) ? singleProduct.countPrices : [];
  const hasOptions = countPrices.length > 0;
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(
    hasOptions && countPrices.length === 1 ? 0 : -1
  );

  // خصائص إضافية
  const productSize = singleProduct?.size || '';
  const productCount = singleProduct?.count || '';

  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  useEffect(() => {
    setImageScale(1.05);
    const timer = setTimeout(() => setImageScale(1), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasColors && colors.length === 1) {
      setSelectedColor(colors[0]);
      setCurrentImageIndex(0);
    } else {
      setSelectedColor('');
      setCurrentImageIndex(0);
    }
    setSelectedQty(1);
    setSelectedOptionIndex(hasOptions && countPrices.length === 1 ? 0 : -1);
  }, [id, hasColors, hasOptions]);

  // السعر المعروض
  const unitPriceBase = useMemo(() => {
    if (!singleProduct) return 0;
    if (hasOptions) {
      if (selectedOptionIndex >= 0)
        return Number(countPrices[selectedOptionIndex].price || 0);
      const nums = countPrices.map((cp) => Number(cp.price)).filter((v) => !Number.isNaN(v));
      if (nums.length) return Math.min(...nums);
    }
    return Number(singleProduct.price || 0);
  }, [singleProduct, hasOptions, selectedOptionIndex, countPrices]);

  const price = unitPriceBase * exchangeRate;
  const oldPrice = singleProduct?.oldPrice
    ? Number(singleProduct.oldPrice) * exchangeRate
    : null;
  const showDiscount = !!oldPrice && oldPrice !== price;
  const discountPercentage = showDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  // المخزون
  const globalStock = Math.max(0, Number(singleProduct?.stock ?? 0));
  const optionStock =
    hasOptions &&
    selectedOptionIndex >= 0 &&
    typeof countPrices[selectedOptionIndex].stock === 'number'
      ? Math.max(0, Number(countPrices[selectedOptionIndex].stock))
      : null;
  const stock = optionStock != null ? optionStock : globalStock;
  const isOutOfStock = stock === 0;

  const clampQty = (v) => {
    if (!Number.isFinite(v)) return 1;
    if (v < 1) return 1;
    if (stock > 0 && v > stock) return stock;
    return v;
  };

  // دالة إضافة المنتج للسلة
  const handleAddToCart = (product) => {
    if (hasColors && !selectedColor) {
      alert('الرجاء اختيار اللون قبل الإضافة إلى السلة');
      return;
    }
    if (hasOptions && selectedOptionIndex < 0) {
      alert('الرجاء اختيار خيار قبل الإضافة إلى السلة');
      return;
    }
    if (isOutOfStock) return;

    setIsAddingToCart(true);
    const qty = clampQty(selectedQty);
    const chosenOption =
      hasOptions && selectedOptionIndex >= 0 ? countPrices[selectedOptionIndex] : null;

    const productToAdd = {
      ...product,
      price: chosenOption
        ? Number(chosenOption.price || 0)
        : product.regularPrice || product.price || 0,
      chosenColor: selectedColor || undefined,
      chosenSize: productSize || undefined,
      chosenCount: productCount || undefined,
      chosenOption: chosenOption
        ? { label: chosenOption.count, price: Number(chosenOption.price || 0) }
        : undefined,
      quantity: qty,
    };

    if (chosenOption && chosenOption.count) {
      productToAdd.chosenCount = String(chosenOption.count);
    }

    dispatch(addToCart(productToAdd));

    // ✅ إعادة تعيين القيم بعد الإضافة
    setSelectedColor('');
    setSelectedOptionIndex(hasOptions && countPrices.length === 1 ? 0 : -1);
    setSelectedQty(1);
    setCurrentImageIndex(0);

    setTimeout(() => setIsAddingToCart(false), 600);
  };

  if (isLoading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;
  if (!singleProduct) return null;

  const disableAdd =
    isOutOfStock ||
    (hasColors && !selectedColor) ||
    (hasOptions && selectedOptionIndex < 0) ||
    selectedQty < 1 ||
    (stock > 0 && selectedQty > stock);

  return (
    <>
      <section className="bg-[#e2e5e5]"></section>

      <section className="section__container mt-8" dir="rtl">
        <div className="flex flex-col items-center md:flex-row gap-8">
          {/* الصور */}
          <div className="md:w-1/2 w-full relative">
            {showDiscount && (
              <div className="absolute top-3 left-3 bg-[#92B0B0] text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                خصم {discountPercentage}%
              </div>
            )}

            {singleProduct.image && singleProduct.image.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-md">
                  <img
                    src={singleProduct.image[currentImageIndex]}
                    alt={singleProduct.name}
                    className="w-full h-auto transition-transform duration-300"
                    style={{ transform: `scale(${imageScale})` }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500';
                      e.target.alt = 'Image not found';
                    }}
                  />
                </div>

                {/* أزرار التنقل */}
                {singleProduct.image.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((i) =>
                          i === 0 ? singleProduct.image.length - 1 : i - 1
                        )
                      }
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((i) =>
                          i === singleProduct.image.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </>
                )}

                {/* الصور المصغّرة */}
                {singleProduct.image.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                    {singleProduct.image.map((img, idx) => {
                      const active = idx === currentImageIndex;
                      return (
                        <button
                          key={`${img}-${idx}`}
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative rounded-md overflow-hidden border aspect-square ${
                            active
                              ? 'border-[#92B0B0] ring-2 ring-[#92B0B0]'
                              : 'border-gray-200 hover:border-[#92B0B0]'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`thumb-${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-red-600">لا توجد صور متاحة لهذا المنتج.</p>
            )}
          </div>

          {/* التفاصيل */}
          <div className="md:w-1/2 w-full">
            <h3 className="text-2xl font-semibold mb-4">{singleProduct.name}</h3>

            {/* السعر */}
            <div className="text-2xl text-[#F5A623] mb-4 space-x-1">
              {price.toFixed(2)} {currency}
              {showDiscount && (
                <s className="text-red-500 text-sm ml-2">
                  {oldPrice?.toFixed(2)} {currency}
                </s>
              )}
            </div>

            <p
              className={`mb-2 text-sm ${
                isOutOfStock ? 'text-red-600' : 'text-lime-700'
              }`}
            >
              المخزون: {stock}
              {isOutOfStock && ' — غير متوفر حالياً'}
            </p>

            <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-line">
              {singleProduct.description}
            </p>

            {/* المقاس والعدد */}
            <div className="flex flex-col gap-3 mt-4">
              {productSize && (
                <div className="text-gray-700">
                  <span className="font-semibold">المقاس:</span>{' '}
                  <span className="text-gray-600">{productSize}</span>
                </div>
              )}
              {productCount && (
                <div className="text-gray-700">
                  <span className="font-semibold">العدد:</span>{' '}
                  <span className="text-gray-600">{productCount}</span>
                </div>
              )}
            </div>

            {/* الألوان */}
            {hasColors && (
              <div className="text-gray-700 mt-4">
                <div className="font-semibold mb-2">اختر اللون:</div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c, idx) => {
                    const active =
                      (selectedColor || '').toLowerCase() ===
                      String(c).toLowerCase();
                    return (
                      <button
                        key={`${c}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c);
                          if (
                            Array.isArray(singleProduct.image) &&
                            singleProduct.image[idx]
                          ) {
                            setCurrentImageIndex(idx);
                          }
                        }}
                        className={`flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-[#92B0B0] text-white shadow-md'
                            : 'bg-[#92B0B0] text-white opacity-80 hover:opacity-100'
                        }`}
                      >
                        {active && (
                          <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full ml-2"></span>
                        )}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* خيارات countPrices */}
            {hasOptions && (
              <div className="mt-5 text-gray-700">
                <div className="font-semibold mb-2">اختر العدد:</div>
                <div className="flex flex-wrap gap-3">
                  {countPrices.map((opt, idx) => {
                    const active = idx === selectedOptionIndex;
                    const optStock =
                      typeof opt.stock === 'number'
                        ? Math.max(0, Number(opt.stock))
                        : null;
                    return (
                      <button
                        key={`${opt.count}-${idx}`}
                        type="button"
                        onClick={() => setSelectedOptionIndex(idx)}
                        className={`flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-[#92B0B0] text-white shadow-md'
                            : 'bg-[#92B0B0] text-white opacity-80 hover:opacity-100'
                        }`}
                      >
                        {active && (
                          <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full ml-2"></span>
                        )}
                        <span className="font-medium">{opt.count}</span>
                        {optStock != null && (
                          <span className="text-xs ml-3">
                            المتوفر: {optStock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* محدد الكمية */}
            <div className="mt-5">
              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => clampQty(q - 1))}
                  disabled={selectedQty <= 1}
                  className={`w-10 h-10 rounded-md border transition ${
                    selectedQty <= 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200'
                      : 'border-[#92B0B0] text-[#92B0B0] hover:bg-black hover:text-white'
                  }`}
                >
                  −
                </button>

                <input
                  type="number"
                  min={1}
                  max={stock || undefined}
                  value={selectedQty}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setSelectedQty(clampQty(Number.isNaN(v) ? 1 : v));
                  }}
                  className="w-16 h-10 text-center border rounded-md border-[#92B0B0] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => clampQty(q + 1))}
                  disabled={stock > 0 ? selectedQty >= stock : false}
                  className={`w-10 h-10 rounded-md border transition ${
                    stock > 0 && selectedQty >= stock
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200'
                      : 'border-[#92B0B0] text-[#92B0B0] hover:bg-black hover:text-white'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* زر الإضافة للسلة */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!disableAdd) handleAddToCart(singleProduct);
              }}
              disabled={disableAdd}
              className={`mt-6 px-6 py-3 text-white rounded-md transition-all duration-200 relative overflow-hidden ${
                disableAdd ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#92B0B0] hover:brightness-95'
              }`}
            >
              {isOutOfStock
                ? 'غير متوفر'
                : hasColors && !selectedColor
                ? 'اختر اللون أولاً'
                : hasOptions && selectedOptionIndex < 0
                ? 'اختر العدد أولاً'
                : `إضافة إلى السلة (${selectedQty})`}
            </button>
          </div>
        </div>
      </section>

      <section className="section__container mt-8" dir="rtl">
        <ReviewsCard productReviews={productReviews} />
      </section>
    </>
  );
};

export default SingleProduct;
