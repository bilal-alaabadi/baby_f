// ========================= src/components/products/SingleProduct.jsx =========================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import ReviewsCard from '../reviews/ReviewsCard';

const getItemId = (x) => x?._id ?? x?.id ?? '';
const getItemOptionLabel = (x) =>
  (x?.chosenOption?.label ?? x?.optionLabel ?? x?.chosenCount ?? '').toString();

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { data, error, isLoading } = useFetchProductByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { country, products: cartProducts } = useSelector((state) => state.cart);

  const singleProduct = data?.product ?? data ?? null;
  const productReviews = singleProduct?.reviews || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);

  // الألوان + مخزون الألوان
  const colorsFromProduct = Array.isArray(singleProduct?.colors) ? singleProduct.colors : [];
  const colorsStock = Array.isArray(singleProduct?.colorsStock) ? singleProduct.colorsStock : [];
  const colors = colorsFromProduct.length > 0
    ? colorsFromProduct
    : colorsStock.map(cs => cs?.color).filter(Boolean);
  const hasColors = colors.length > 0;
  const [selectedColor, setSelectedColor] = useState('');

  const getColorStock = (c) => {
    if (!c) return null;
    const cs = colorsStock.find(x => String(x?.color || '').toLowerCase() === String(c).toLowerCase());
    return typeof cs?.stock === 'number' ? Math.max(0, Number(cs.stock)) : null;
  };

  // خيارات countPrices
  const countPrices = Array.isArray(singleProduct?.countPrices) ? singleProduct.countPrices : [];
  const hasOptions = countPrices.length > 0;
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(
    hasOptions && countPrices.length === 1 ? 0 : -1
  );

  // خصائص إضافية (نصية)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const oldPrice = singleProduct?.oldPrice ? Number(singleProduct.oldPrice) * exchangeRate : null;
  const showDiscount = !!oldPrice && oldPrice !== price;
  const discountPercentage = showDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  // المخزون العام
  const globalStock = Math.max(0, Number(singleProduct?.stock ?? 0));

  // مخزون الخيار المختار (خام)
  const optionStock =
    hasOptions &&
    selectedOptionIndex >= 0 &&
    typeof countPrices[selectedOptionIndex].stock === 'number'
      ? Math.max(0, Number(countPrices[selectedOptionIndex].stock))
      : null;

  // مخزون اللون المختار (خام)
  const colorStock =
    hasColors && selectedColor
      ? getColorStock(selectedColor)
      : null;

  const colorChosen = hasColors && !!selectedColor;
  const optionChosen = hasOptions && selectedOptionIndex >= 0;

  // --------- الحجز الافتراضي (جامع) ----------
  const reservedSum = (colorMaybe, optionLabelMaybe) => {
    const thisId = getItemId(singleProduct) || id;
    return cartProducts.reduce((sum, p) => {
      if (getItemId(p) !== thisId) return sum;

      const pColor = (p.chosenColor || p.color || '').toString().toLowerCase();
      const targetColor = (colorMaybe || '').toString().toLowerCase();

      const pOptLabel = getItemOptionLabel(p);
      const targetOptLabel = optionLabelMaybe != null ? String(optionLabelMaybe) : null;

      let match = false;

      if (colorMaybe && targetOptLabel != null) {
        // لون + خيار (تطابق تام)
        match = (pColor === targetColor) && (pOptLabel === targetOptLabel);
      } else if (colorMaybe && targetOptLabel == null) {
        // لون فقط: أي خيار
        match = (pColor === targetColor);
      } else if (!colorMaybe && targetOptLabel != null) {
        // خيار فقط: أي لون
        match = (pOptLabel === targetOptLabel);
      } else {
        // منتج عادي: أي سطر لنفس المنتج
        match = true;
      }

      return match ? sum + (Number(p.quantity) || 0) : sum;
    }, 0);
  };

  const rawOptionStockByLabel = (label) => {
    const idx = countPrices.findIndex((cp) => String(cp.count) === String(label));
    return idx >= 0 && typeof countPrices[idx]?.stock === 'number'
      ? Math.max(0, Number(countPrices[idx].stock))
      : null;
  };

  // متبقي للّون فقط (يخصم كل المحجوز لذلك اللون عبر كل الخيارات)
  const remainingForColorOnly = (c) => {
    const colorS = c ? getColorStock(c) : null;
    if (!Number.isFinite(colorS)) return null;
    const reserved = reservedSum(c, null);
    return Math.max(0, colorS - reserved);
  };

  // متبقي للخيار فقط (يخصم كل المحجوز لذلك الخيار عبر كل الألوان)
  const remainingForOptionOnly = (label) => {
    const optS = rawOptionStockByLabel(label);
    if (!Number.isFinite(optS)) return null;
    const reserved = reservedSum(null, label);
    return Math.max(0, optS - reserved);
  };

  // ✅ متبقي للتركيبة (لون × خيار) = min(متبقي اللون، متبقي الخيار)
  // هذا يضمن أن حجز خيار قطع معيّن ينقص من باقي الألوان أيضاً
  const pairRemaining = (c, label) => {
    const colorRemain = remainingForColorOnly(c);
    const optionRemain = remainingForOptionOnly(label);
    if (!Number.isFinite(colorRemain) || !Number.isFinite(optionRemain)) return 0;
    return Math.max(0, Math.min(colorRemain, optionRemain));
  };

  // وجود تركيبة متاحة لأي لون
  const hasAnyPairForColor = (c) => {
    if (!hasOptions) {
      const r = remainingForColorOnly(c);
      return Number.isFinite(r) && r > 0;
    }
    return countPrices.some((opt) => pairRemaining(c, String(opt.count)) > 0);
  };

  // وجود تركيبة متاحة لأي خيار
  const hasAnyPairForOption = (label) => {
    if (!hasColors) {
      const r = remainingForOptionOnly(label);
      return Number.isFinite(r) && r > 0;
    }
    return colors.some((c) => pairRemaining(c, label) > 0);
  };

  // هل توجد أي تركيبة متاحة على الإطلاق؟
  const anyAvailableVariant = useMemo(() => {
    if (!singleProduct) return false;

    if (!hasColors && !hasOptions) {
      const r = Math.max(0, globalStock - reservedSum(null, null));
      return r > 0;
    }
    if (hasColors && !hasOptions) {
      return colors.some((c) => hasAnyPairForColor(c));
    }
    if (!hasColors && hasOptions) {
      return countPrices.some((opt) => hasAnyPairForOption(String(opt.count)));
    }
    // كلاهما موجودان
    return colors.some((c) =>
      countPrices.some((opt) => pairRemaining(c, String(opt.count)) > 0)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleProduct, cartProducts, colors, countPrices, hasColors, hasOptions]);

  const exhaustedAll = !anyAvailableVariant;

  // المتبقي للعرض حسب الاختيار الحالي
  const remainingAfterReserve = useMemo(() => {
    if (!singleProduct) return null;

    if (!hasColors && !hasOptions) {
      return Math.max(0, globalStock - reservedSum(null, null));
    }

    if (hasColors && hasOptions) {
      if (selectedColor && selectedOptionIndex >= 0) {
        const label = String(countPrices[selectedOptionIndex]?.count ?? '');
        return pairRemaining(selectedColor, label);
      }
      if (selectedColor && selectedOptionIndex < 0) {
        return remainingForColorOnly(selectedColor);
      }
      if (!selectedColor && selectedOptionIndex >= 0) {
        const label = String(countPrices[selectedOptionIndex]?.count ?? '');
        return remainingForOptionOnly(label);
      }
      return null;
    }

    if (hasColors && selectedColor) return remainingForColorOnly(selectedColor);
    if (hasOptions && selectedOptionIndex >= 0) {
      const label = String(countPrices[selectedOptionIndex]?.count ?? '');
      return remainingForOptionOnly(label);
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleProduct, cartProducts, selectedColor, selectedOptionIndex, hasColors, hasOptions]);

  // تنظيف الاختيارات إن أصبحت غير صالحة (لا توجد أي تركيبة)
  useEffect(() => {
    if (!singleProduct) return;

    if (hasColors && selectedColor) {
      if (!hasAnyPairForColor(selectedColor)) setSelectedColor('');
    }
    if (hasOptions && selectedOptionIndex >= 0) {
      const label = String(countPrices[selectedOptionIndex]?.count ?? '');
      if (!hasAnyPairForOption(label)) setSelectedOptionIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartProducts, hasColors, hasOptions, selectedColor, selectedOptionIndex]);

  const shouldShowStockBlock = (() => {
    if (!hasColors && !hasOptions) return true;
    if (exhaustedAll) return false;
    if (selectedColor || selectedOptionIndex >= 0) return true;
    return false;
  })();

  const isOutOfStock = exhaustedAll || (Number.isFinite(remainingAfterReserve) && remainingAfterReserve <= 0);

  const clampQty = (v) => {
    if (!Number.isFinite(v)) return 1;
    if (v < 1) return 1;
    const limit = Number.isFinite(remainingAfterReserve) ? remainingAfterReserve : Infinity;
    return Math.min(v, limit);
  };

  // =================== إضافة للسلة ===================
  const handleAddToCart = (product) => {
    if (exhaustedAll) return;
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
    const chosenOptionRaw =
      hasOptions && selectedOptionIndex >= 0 ? countPrices[selectedOptionIndex] : null;

    const currentColorStock =
      hasColors && selectedColor ? (Number.isFinite(getColorStock(selectedColor)) ? Number(getColorStock(selectedColor)) : undefined) : undefined;

    const currentOptionStock =
      hasOptions && chosenOptionRaw
        ? (Number.isFinite(chosenOptionRaw?.stock) ? Number(chosenOptionRaw.stock) : undefined)
        : undefined;

    const maxStockForCart = (() => {
      if (hasColors && hasOptions) {
        const a = Number.isFinite(currentColorStock) ? currentColorStock : undefined;
        const b = Number.isFinite(currentOptionStock) ? currentOptionStock : undefined;
        if (a != null && b != null) return Math.min(a, b);
        if (a != null) return a;
        if (b != null) return b;
        return undefined;
      }
      if (hasColors) return currentColorStock;
      if (hasOptions) return currentOptionStock;
      return Number.isFinite(globalStock) ? globalStock : undefined;
    })();

    const chosenOption =
      chosenOptionRaw
        ? {
            label: String(chosenOptionRaw.count),
            price: Number(chosenOptionRaw.price || 0),
            ...(Number.isFinite(chosenOptionRaw.stock) ? { stock: Number(chosenOptionRaw.stock) } : {}),
          }
        : undefined;

    const productToAdd = {
      ...product,
      price: chosenOption
        ? Number(chosenOption.price || 0)
        : (Number(product.regularPrice) || Number(product.price) || 0),

      chosenColor: selectedColor || undefined,
      chosenSize: productSize || undefined,
      chosenCount: chosenOption ? String(chosenOption.label) : (productCount || undefined),
      chosenOption,

      ...(Number.isFinite(currentColorStock) && { colorStock: Number(currentColorStock) }),
      ...(Number.isFinite(currentOptionStock) && { optionStock: Number(currentOptionStock) }),
      ...(Number.isFinite(maxStockForCart) && { maxStock: Number(maxStockForCart) }),

      quantity: qty,
    };

    dispatch(addToCart(productToAdd));
    setSelectedQty(1);
    setIsAddingToCart(false);
  };

  if (isLoading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;
  if (!singleProduct) return null;

  const disableAdd =
    exhaustedAll ||
    isOutOfStock ||
    (hasColors && !selectedColor) ||
    (hasOptions && selectedOptionIndex < 0) ||
    selectedQty < 1 ||
    (Number.isFinite(remainingAfterReserve) && selectedQty > remainingAfterReserve);

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
                <s className="text-red-500 text-sm ml-2">{oldPrice?.toFixed(2)} {currency}</s>
              )}
            </div>

            {/* في حال نفاد كل التركيبات */}
            {!anyAvailableVariant && (
              <div className="mb-3 text-sm text-red-600">
                هذا المنتج غير متوفر حالياً بجميع المتغيرات.
              </div>
            )}

            {/* سطور المخزون/المتبقي بعد الحجز */}
            {(() => {
              if (!anyAvailableVariant) return null;
              const remainingText = Number.isFinite(remainingAfterReserve) ? remainingAfterReserve : null;
              if (!hasColors && !hasOptions) {
                return (
                  <div className="mb-2 text-sm">
                    <p className={remainingText === 0 ? 'text-red-600' : 'text-lime-700'}>
                      المتبقي: {remainingText ?? Math.max(0, globalStock - reservedSum(null, null))}
                    </p>
                  </div>
                );
              }
              if (!(colorChosen || optionChosen)) return null;

              return (
                <div className="mb-2 text-sm space-y-1">
                  {hasColors && selectedColor && (
                    <p className={remainingText === 0 ? 'text-red-600' : 'text-lime-700'}>
                      المتبقي للّون "{selectedColor}": {remainingText ?? 0}
                    </p>
                  )}
                  {hasOptions && selectedOptionIndex >= 0 && (
                    <p className={remainingText === 0 ? 'text-red-600' : 'text-lime-700'}>
                      المتبقي لعدد القطع "{countPrices[selectedOptionIndex].count}": {remainingText ?? 0}
                    </p>
                  )}
                </div>
              );
            })()}

            <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-line">
              {singleProduct.description}
            </p>

            {/* المقاس والعدد النصي */}
            <div className="flex flex-col gap-3 mt-4">
              {productSize && (
                <div className="text-gray-700">
                  <span className="font-semibold">المقاس:</span>{' '}
                  <span className="text-gray-600">{productSize}</span>
                </div>
              )}
              {productCount && (
                <div className="text-gray-700">
                  <span className="font-semibold">عدد القطع:</span>{' '}
                  <span className="text-gray-600">{productCount}</span>
                </div>
              )}
            </div>

            {/* الألوان — تتعطّل إذا ولا تركيبة متاحة لهذا اللون */}
            {hasColors && (
              <div className="text-gray-700 mt-4">
                <div className="font-semibold mb-2">اختر اللون:</div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c, idx) => {
                    const hasPair = hasAnyPairForColor(c);
                    const out = !hasPair || !anyAvailableVariant;
                    const active = (selectedColor || '').toLowerCase() === String(c).toLowerCase();

                    return (
                      <button
                        key={`${c}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (out) return;
                          setSelectedColor(c);
                          if (Array.isArray(singleProduct.image) && singleProduct.image[idx]) {
                            setCurrentImageIndex(idx);
                          }
                        }}
                        disabled={out}
                        className={`relative flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-[#92B0B0] text-white shadow-md'
                            : out
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-[#92B0B0] text-white opacity-80 hover:opacity-100'
                        }`}
                        title={out ? 'غير متوفر' : undefined}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* خيارات القطع — تتعطّل إذا ولا تركيبة متاحة لهذا الخيار */}
            {hasOptions && (
              <div className="mt-5 text-gray-700">
                <div className="font-semibold mb-2">اختر عدد القطع:</div>
                <div className="flex flex-wrap gap-3">
                  {countPrices.map((opt, idx) => {
                    const label = String(opt.count);
                    const hasPair = hasAnyPairForOption(label);
                    const out = !hasPair || !anyAvailableVariant;
                    const active = idx === selectedOptionIndex;

                    return (
                      <button
                        key={`${opt.count}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (out) return;
                          setSelectedOptionIndex(idx);
                        }}
                        disabled={out}
                        className={`flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          active && !out
                            ? 'bg-[#92B0B0] text-white shadow-md'
                            : out
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-[#92B0B0] text-white opacity-80 hover:opacity-100'
                        }`}
                        title={out ? 'غير متوفر' : undefined}
                      >
                        <span className="font-medium">{opt.count}</span>
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
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  disabled={selectedQty <= 1 || !anyAvailableVariant}
                  className={`w-10 h-10 rounded-md border transition ${
                    (selectedQty <= 1 || !anyAvailableVariant)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200'
                      : 'border-[#92B0B0] text-[#92B0B0] hover:bg-black hover:text-white'
                  }`}
                >
                  −
                </button>

                <input
                  type="number"
                  min={1}
                  max={Number.isFinite(remainingAfterReserve) ? remainingAfterReserve : undefined}
                  value={selectedQty}
                  onChange={(e) => {
                    if (!anyAvailableVariant) return;
                    const v = Number(e.target.value);
                    const limit = Number.isFinite(remainingAfterReserve) ? remainingAfterReserve : Infinity;
                    const clamped = Math.min(Math.max(1, Number.isNaN(v) ? 1 : v), limit);
                    setSelectedQty(clamped);
                  }}
                  disabled={!anyAvailableVariant}
                  className="w-16 h-10 text-center border rounded-md border-[#92B0B0] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => {
                    if (!Number.isFinite(remainingAfterReserve)) return q + 1;
                    return Math.min(q + 1, remainingAfterReserve);
                  })}
                  disabled={!anyAvailableVariant || (Number.isFinite(remainingAfterReserve) && selectedQty >= remainingAfterReserve)}
                  className={`w-10 h-10 rounded-md border transition ${
                    !anyAvailableVariant || (Number.isFinite(remainingAfterReserve) && selectedQty >= remainingAfterReserve)
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
              className={`mt-6 px-6 py-3 text-white rounded-md transition-all	duration-200 relative overflow-hidden ${
                disableAdd ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#92B0B0] hover:brightness-95'
              }`}
            >
              {!anyAvailableVariant
                ? 'غير متوفر'
                : (hasColors && !selectedColor)
                ? 'اختر اللون أولاً'
                : (hasOptions && selectedOptionIndex < 0)
                ? 'اختر عدد القطع أولاً'
                : (isOutOfStock ? 'غير متوفر' : `إضافة إلى السلة (${selectedQty})`)}
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
