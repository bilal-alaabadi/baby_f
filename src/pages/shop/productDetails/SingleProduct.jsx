// ========================= src/components/products/SingleProduct.jsx =========================
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const productReviews = (singleProduct?.reviews) || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // خيارات المنتج
  const colors = Array.isArray(singleProduct?.colors) ? singleProduct.colors : [];
  const hasColors = colors.length > 0;
  const productSize = singleProduct?.size || '';   // مقاس (اختياري)
  const productCount = singleProduct?.count || ''; // العدد (اختياري)
  const [selectedColor, setSelectedColor] = useState('');

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
    } else {
      setSelectedColor('');
    }
  }, [id, hasColors]);

  const handleAddToCart = (product) => {
    if (hasColors && !selectedColor) {
      alert('الرجاء اختيار اللون قبل الإضافة إلى السلة');
      return;
    }

    setIsAddingToCart(true);
    const productToAdd = {
      ...product,
      price: product.regularPrice || product.price || 0,
      chosenColor: selectedColor || undefined,
      chosenSize: productSize || undefined,    // مقاس إن وجد
      chosenCount: productCount || undefined,  // العدد إن وجد
    };
    dispatch(addToCart(productToAdd));
    setTimeout(() => setIsAddingToCart(false), 1000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === (singleProduct?.image?.length ?? 0) - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? (singleProduct?.image?.length ?? 0) - 1 : prevIndex - 1
    );
  };

  if (isLoading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;
  if (!singleProduct) return null;

  const rawStock = singleProduct?.stock ?? data?.stock ?? data?.product?.stock ?? 0;
  const stock = Math.max(0, Number(rawStock));
  const isOutOfStock = stock === 0;

  const unitBase = singleProduct.regularPrice || singleProduct.price || 0;
  const price = unitBase * exchangeRate;
  const oldPrice = singleProduct.oldPrice ? singleProduct.oldPrice * exchangeRate : null;
  const showDiscount = !!oldPrice && oldPrice !== price;
  const discountPercentage = showDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <>
      <section className=' bg-[#e2e5e5]'>
        {/* مسار تنقّل إن رغبت */}
      </section>

      <section className='section__container mt-8' dir='rtl'>
        <div className='flex flex-col items-center md:flex-row gap-8'>
          {/* Product Image */}
          <div className='md:w-1/2 w-full relative'>
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
                    className={`w-full h-auto transition-transform duration-300`}
                    style={{ transform: `scale(${imageScale})` }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/500";
                      e.target.alt = "Image not found";
                    }}
                  />
                </div>
                {singleProduct.image.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className='absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full'
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button
                      onClick={nextImage}
                      className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full'
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </>
                )}
              </>
            ) : (
              <p className="text-red-600">لا توجد صور متاحة لهذا المنتج.</p>
            )}
          </div>

          <div className='md:w-1/2 w-full'>
            <h3 className='text-2xl font-semibold mb-4'>{singleProduct.name}</h3>

            {/* عرض المخزون */}
            <p className={`mb-2 text-sm ${isOutOfStock ? 'text-red-600' : 'text-gray-600'}`}>
              المتوفر بالمخزون: {stock}{isOutOfStock && ' — غير متوفر حالياً'}
            </p>

            {/* السعر */}
            <div className='text-xl text-[#3D4B2E] mb-4 space-x-1'>
              {price.toFixed(2)} {currency}
              {showDiscount && (
                <s className="text-red-500 text-sm ml-2">{oldPrice.toFixed(2)} {currency}</s>
              )}
            </div>

            {/* تفاصيل المنتج */}
            <div className='flex flex-col gap-3'>
              {/* الفئة/النوع */}
              <div className="text-gray-700">
                <span className="font-semibold">الفئة:</span>{' '}
                <span className="text-gray-600">{singleProduct.category}</span>
              </div>

              {/* المقاس (اختياري) */}
              {productSize && (
                <div className="text-gray-700">
                  <span className="font-semibold">المقاس:</span>{' '}
                  <span className="text-gray-600">{productSize}</span>
                </div>
              )}

              {/* العدد (اختياري) */}
              {productCount && (
                <div className="text-gray-700">
                  <span className="font-semibold">العدد:</span>{' '}
                  <span className="text-gray-600">{productCount}</span>
                </div>
              )}

              {/* الألوان (اختياري) */}
              {colors.length > 0 && (
                <div className="text-gray-700">
                  <div className="font-semibold mb-2">اختر اللون:</div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c, idx) => {
                      const active = (selectedColor || '').toLowerCase() === String(c).toLowerCase();
                      return (
                        <button
                          key={`${c}-${idx}`}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1 rounded-full border text-sm transition
                            ${active ? 'bg-[#92B0B0] text-white border-[#92B0B0]' : 'bg-white hover:bg-gray-50'}
                          `}
                          aria-pressed={active}
                          aria-label={`اختر اللون ${c}`}
                          title={c}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedColor && (
                    <p className="text-xs text-gray-500 mt-1">يرجى اختيار لون قبل الإضافة للسلة.</p>
                  )}
                </div>
              )}
            </div>

            {/* الوصف */}
            <p className="text-gray-600 mt-4 leading-relaxed">
              {singleProduct.description}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                  handleAddToCart(singleProduct);
                }
              }}
              disabled={isOutOfStock || (colors.length > 0 && !selectedColor)}
              className={`mt-6 px-6 py-3 text-white rounded-md transition-all duration-200 relative overflow-hidden
                ${isOutOfStock || (colors.length > 0 && !selectedColor)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#92B0B0] hover:brightness-95'}`}
            >
              {isOutOfStock
                ? 'غير متوفر'
                : (colors.length > 0 && !selectedColor)
                  ? 'اختر اللون أولاً'
                  : 'إضافة إلى السلة'}
            </button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className='section__container mt-8' dir='rtl'>
        <ReviewsCard productReviews={productReviews} />
      </section>
    </>
  );
};

export default SingleProduct;
