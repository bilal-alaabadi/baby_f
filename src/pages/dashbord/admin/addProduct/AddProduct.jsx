// ========================= src/components/admin/addProduct/AddProduct.jsx =========================
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';

// الفئات الرئيسية
const mainCategories = [
  { label: 'أختر الفئة الرئيسية', value: '' },
  { label: 'الألعاب', value: 'الألعاب' },
  { label: 'مستلزمات المواليد', value: 'مستلزمات المواليد' }
];

const subCategories = {
  'الألعاب': [
    { label: 'ألعاب تعليمية', value: 'ألعاب تعليمية' },
    { label: 'ألعاب تنمية المهارات', value: 'ألعاب تنمية المهارات' },
    { label: 'ألعاب ترفيهية', value: 'ألعاب ترفيهية' },
    { label: 'ألعاب رضع', value: 'ألعاب رضع' },
  ],
  'مستلزمات المواليد': [
    { label: 'سرير وأثاث الطفل', value: 'سرير وأثاث الطفل' },
    { label: 'مستلزمات استحمام', value: 'مستلزمات استحمام' },
    { label: 'مستلزمات أخرى', value: 'مستلزمات أخرى' },
  ],
};

const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState({
    name: '',
    mainCategory: '',
    category: '',
    price: '',
    oldPrice: '',
    description: '',
    stock: 1,
    size: '',
    count: '',
  });

  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const [options, setOptions] = useState([{ name: '', price: '', stock: '' }]);
  const [image, setImage] = useState([]);
  const [addProduct, { isLoading, error }] = useAddProductMutation();
  const navigate = useNavigate();

  useEffect(() => {
    setProduct((prev) => ({ ...prev, category: '' }));
  }, [product.mainCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // ============ المخزون ============
  const setSafeStock = (val) => {
    const n = Number.isNaN(Number(val)) ? 0 : Math.floor(Number(val));
    const clamped = Math.max(0, n);
    setProduct((prev) => ({ ...prev, stock: clamped }));
  };
  const incStock = () => setSafeStock((product.stock || 0) + 1);
  const decStock = () => setSafeStock((product.stock || 0) - 1);

  // ============ الألوان ============
  const addColor = () => {
    const c = (colorInput || '').trim();
    if (!c) return;
    const exists = colors.some(x => x.toLowerCase() === c.toLowerCase());
    if (exists) { setColorInput(''); return; }
    setColors(prev => [...prev, c]);
    setColorInput('');
  };
  const removeColor = (idx) => setColors(prev => prev.filter((_, i) => i !== idx));
  const handleKeyDownOnColor = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addColor(); }
  };

  // ============ قسم الخيارات ============
  const addOption = () => {
    setOptions(prev => [...prev, { name: '', price: '', stock: '' }]);
  };
  const removeOption = (idx) => {
    setOptions(prev => prev.filter((_, i) => i !== idx));
  };
  const updateOption = (idx, field, value) => {
    setOptions(prev => prev.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt));
  };

  const minOptionPrice = useMemo(() => {
    const nums = options.map(o => Number(o.price)).filter(v => !Number.isNaN(v));
    if (!nums.length) return null;
    return Math.min(...nums);
  }, [options]);

  // ============ الإرسال ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredBase = {
      'أسم المنتج': product.name,
      'الفئة الرئيسية': product.mainCategory,
      'النوع': product.category,
      'الوصف': product.description,
      'الصور': image.length > 0,
    };

    if (!optionsEnabled) {
      requiredBase['السعر'] = product.price;
    } else if (options.length === 0) {
      alert('أضف خيارًا واحدًا على الأقل.');
      return;
    }

    const missing = Object.entries(requiredBase).filter(([_, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      alert(`الرجاء ملء/تصحيح الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    try {
      const priceToSend = optionsEnabled
        ? Number(minOptionPrice ?? 0)
        : Number(product.price);

      const countPrices = optionsEnabled
        ? options.map(o => ({
            count: String(o.name).trim(),
            price: Number(o.price),
            stock: (o.stock === '' || o.stock === null)
              ? undefined
              : Math.floor(Number(o.stock))
          }))
        : [];

      // === إصلاح حفظ المخزون عند تفعيل الخيارات ===
      // إذا لم تُدخل مخزونات للخيار، لا نجمع 0 بل نستخدم المخزون العام
      const optionStocks = optionsEnabled
        ? countPrices
            .map(x => (typeof x.stock === 'number' && x.stock >= 0 ? x.stock : null))
            .filter(v => v !== null)
        : [];

      const totalOptionStock = optionsEnabled
        ? (optionStocks.length ? optionStocks.reduce((a, b) => a + b, 0) : null)
        : null;

      await addProduct({
        ...product,
        price: priceToSend,
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
        stock: optionsEnabled
          ? (totalOptionStock != null ? totalOptionStock : Number(product.stock || 0))
          : Number(product.stock),
        size: product.size?.trim() ? product.size.trim() : undefined,
        colors,
        image,
        author: user?._id,
        countPrices,
      }).unwrap();

      alert('تمت إضافة المنتج بنجاح');
      navigate('/shop');
    } catch (err) {
      console.log('Failed to submit product', err);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  // ============ JSX ============
  return (
    <div className="container mx-auto mt-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">إضافة منتج جديد</h2>

      {error?.data?.message && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error.data.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* تفعيل/تعطيل قسم الخيارات */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="font-medium">تفعيل/تعطيل قسم عدد القطع </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={optionsEnabled}
              onChange={(e) => setOptionsEnabled(e.target.checked)}
            />
            <span className="text-sm">تفعيل</span>
          </label>
        </div>

        <TextInput label="أسم المنتج" name="name" placeholder="أكتب أسم المنتج" value={product.name} onChange={handleChange} />

        <SelectInput label="الفئة الرئيسية" name="mainCategory" value={product.mainCategory} onChange={handleChange} options={mainCategories} />

        <SelectInput
          label="النوع"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={product.mainCategory ? [{ label: 'أختر النوع', value: '' }, ...(subCategories[product.mainCategory] || [])] : [{ label: 'أختر النوع', value: '' }]}
        />

        <TextInput label="المقاس (اختياري)" name="size" type="text" placeholder="مثال: XL أو 24cm" value={product.size} onChange={handleChange} />

        {/* السعر العام (فقط عند تعطيل الخيارات) */}
        {!optionsEnabled && (
          <>
            <TextInput label="السعر القديم (اختياري)" name="oldPrice" type="number" min="0" step="0.01" placeholder="100" value={product.oldPrice} onChange={handleChange} />
            <TextInput label="السعر" name="price" type="number" min="0" step="0.01" placeholder="50" value={product.price} onChange={handleChange} />
          </>
        )}

        {/* 🟢 الكمية (المخزون) دائمًا ظاهرة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الكمية (المخزون)</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={decStock} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border">−</button>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={product.stock}
              onChange={(e) => setSafeStock(e.target.value)}
              className="add-product-InputCSS w-28 text-center"
            />
            <button type="button" onClick={incStock} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border">+</button>
          </div>
        </div>

        {/* قسم الخيارات */}
        {optionsEnabled && (
          <div className="space-y-3 p-3 border rounded-lg bg-slate-800/5">
            <div className="flex items-center justify-between">
              <span className="font-medium">قسم الخيارات</span>
              <button type="button" onClick={addOption} className="text-sm px-3 py-1 rounded-md border bg-gray-100 hover:bg-gray-200">إضافة خيار +</button>
            </div>

            {options.map((opt, idx) => (
              <div key={idx} className="rounded-lg border p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">عدد القطع</label>
                    <input type="text" className="add-product-InputCSS w-full" placeholder="مثال: 32 قطعة" value={opt.name} onChange={(e) => updateOption(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">(اختياري) سعر القطع</label>
                    <input type="number" min="0" step="0.01" className="add-product-InputCSS w-full" placeholder="مثال: 6.89" value={opt.price} onChange={(e) => updateOption(idx, 'price', e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => removeOption(idx)} className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600">حذف الخيار</button>
                </div>
              </div>
            ))}

            {minOptionPrice != null && (
              <p className="text-xs text-gray-600">أقل سعر بين الخيارات الحالية: {minOptionPrice}</p>
            )}
          </div>
        )}

        {/* الألوان */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الألوان المتوفرة (اختياري)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="add-product-InputCSS flex-1"
              placeholder="اكتب اسم اللون ثم اضغط إضافة"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={handleKeyDownOnColor}
            />
            <button type="button" onClick={addColor} className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-black">إضافة لون</button>
          </div>
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {colors.map((c, i) => (
                <span key={`${c}-${i}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-gray-50 text-sm">
                  {c}
                  <button type="button" onClick={() => removeColor(i)} className="text-red-600 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <UploadImage name="image" id="image" uploaded={image} setImage={setImage} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">وصف المنتج</label>
          <textarea name="description" id="description" className="add-product-InputCSS" value={product.description} onChange={handleChange} rows={4} />
        </div>

        <button type="submit" className="add-product-btn" disabled={isLoading}>
          {isLoading ? 'جاري الإضافة...' : 'أضف منتج'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
