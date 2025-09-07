import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import ReviewsCard from '../reviews/ReviewsCard';

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // 👇 أجبر إعادة الجلب لتفادي بيانات قديمة من الكاش
  const { data, error, isLoading, refetch } = useFetchProductByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { country } = useSelector((state) => state.cart);

  // قد يكون المنتج داخل data مباشرة أو داخل data.product حسب الـAPI
  const singleProduct = data?.product ?? data ?? null;
  const productReviews = (singleProduct?.reviews) || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // العملة وسعر الصرف
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  useEffect(() => {
    setImageScale(1.05);
    const timer = setTimeout(() => setImageScale(1), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product) => {
    setIsAddingToCart(true);
    const productToAdd = {
      ...product,
      price: product.regularPrice || product.price || 0
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

  // 👇 قراءة stock بشكل آمن من أكثر من مسار + تحويله لرقم
  const rawStock = singleProduct?.stock ?? data?.stock ?? data?.product?.stock ?? 0;
  const stock = Math.max(0, Number(rawStock)); // يحوّل "5" إلى 5، ويقص السالب إلى 0
  const isOutOfStock = stock === 0;

  // الأسعار
  const unitBase = singleProduct.regularPrice || singleProduct.price || 0;
  const price = unitBase * exchangeRate;
  const oldPrice = singleProduct.oldPrice ? singleProduct.oldPrice * exchangeRate : null;
  const showDiscount = !!oldPrice && oldPrice !== price;
  const discountPercentage = showDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <>
      <section className=' bg-[#e2e5e5]'>
        {/* <h2 className='section__header capitalize'>صفحة المنتج الفردي</h2>
        <div className='section__subheader space-x-2'>
          <span className='hover:text-[#4E5A3F]'><Link to="/">الرئيسية</Link></span>
          <i className="ri-arrow-right-s-line"></i>
          <span className='hover:text-[#4E5A3F]'><Link to="/shop">المتجر</Link></span>
          <i className="ri-arrow-right-s-line"></i>
          <span className='hover:text-[#4E5A3F]'>{singleProduct.name}</span>
        </div> */}
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

            {/* ✨ عرض المخزون */}
            <p className={`mb-2 text-sm ${isOutOfStock ? 'text-red-600' : 'text-gray-600'}`}>
              المتوفر بالمخزون: {stock}{isOutOfStock && ' — غير متوفر حالياً'}
            </p>

            {/* Price */}
            <div className='text-xl text-[#3D4B2E] mb-4 space-x-1'>
              {price.toFixed(2)} {currency}
              {showDiscount && (
                <s className="text-red-500 text-sm ml-2">{oldPrice.toFixed(2)} {currency}</s>
              )}
            </div>

            {/* Product Info */}
            <div className='flex flex-col space-y-2'>
              <p className="text-gray-500 mb-4 text-lg font-medium leading-relaxed">
                <span className="text-gray-800 font-bold block">الفئة:</span> 
                <span className="text-gray-600">{singleProduct.category}</span>
              </p>
            </div>
            <p className="text-gray-500 mb-4 text-lg font-medium leading-relaxed">
              <span className="text-gray-800 font-bold block">الوصف:</span> 
              <span className="text-gray-600">{singleProduct.description}</span>
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                  setIsAddingToCart(true);
                  const productToAdd = {
                    ...singleProduct,
                    price: singleProduct.regularPrice || singleProduct.price || 0
                  };
                  dispatch(addToCart(productToAdd));
                  setTimeout(() => setIsAddingToCart(false), 1000);
                }
              }}
              disabled={isOutOfStock}
              className={`mt-6 px-6 py-3 text-white rounded-md transition-all duration-200 relative overflow-hidden
                ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#92B0B0] '}
                ${isAddingToCart ? 'bg-green-600' : ''}
              `}
            >
              {isOutOfStock ? 'غير متوفر' : isAddingToCart ? 'تمت الإضافة!' : 'إضافة إلى السلة'}
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
