// ========================= src/components/admin/addProduct/AddProduct.jsx =========================
import React, { useState, useEffect } from 'react';
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

// الأنواع (تصنيفات فرعية) حسب الفئة الرئيسية
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
    stock: 1,   // الكمية الافتراضية
    size: '',   // مقاس (اختياري)
    count: '',  // العدد (اختياري)
  });

  // الألوان (اختياري الآن)
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState('');

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

  const setSafeStock = (val) => {
    const n = Number.isNaN(Number(val)) ? 0 : Math.floor(Number(val));
    const clamped = Math.max(0, n);
    setProduct((prev) => ({ ...prev, stock: clamped }));
  };
  const incStock = () => setSafeStock((product.stock || 0) + 1);
  const decStock = () => setSafeStock((product.stock || 0) - 1);

  const addColor = () => {
    const c = (colorInput || '').trim();
    if (!c) return;
    const exists = colors.some(x => x.toLowerCase() === c.toLowerCase());
    if (exists) {
      setColorInput('');
      return;
    }
    setColors(prev => [...prev, c]);
    setColorInput('');
  };
  const removeColor = (idx) => setColors(prev => prev.filter((_, i) => i !== idx));
  const handleKeyDownOnColor = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      'أسم المنتج': product.name,
      'الفئة الرئيسية': product.mainCategory,
      'النوع': product.category,
      'السعر': product.price,
      'الوصف': product.description,
      'الصور': image.length > 0,
      'الكمية (المخزون)': Number(product.stock) >= 1,
    };

    const missing = Object.entries(required)
      .filter(([_, v]) => !v)
      .map(([k]) => k);

    if (missing.length > 0) {
      alert(`الرجاء ملء/تصحيح الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    try {
      await addProduct({
        ...product,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
        stock: Number(product.stock),
        size: product.size?.trim() ? product.size.trim() : undefined,   // اختياري
        count: product.count?.trim() ? product.count.trim() : undefined, // اختياري
        colors,  // اختياري (قد تكون فارغة)
        image,
        author: user?._id,
      }).unwrap();

      alert('تمت إضافة المنتج بنجاح');
      setProduct({
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
      setColors([]);
      setColorInput('');
      setImage([]);
      navigate('/shop');
    } catch (err) {
      console.log('Failed to submit product', err);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  return (
    <div className="container mx-auto mt-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">إضافة منتج جديد</h2>

      {error?.data?.message && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error.data.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="أسم المنتج"
          name="name"
          placeholder="أكتب أسم المنتج"
          value={product.name}
          onChange={handleChange}
        />

        <SelectInput
          label="الفئة الرئيسية"
          name="mainCategory"
          value={product.mainCategory}
          onChange={handleChange}
          options={mainCategories}
        />

        <SelectInput
          label="النوع"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={
            product.mainCategory
              ? [{ label: 'أختر النوع', value: '' }, ...(subCategories[product.mainCategory] || [])]
              : [{ label: 'أختر النوع', value: '' }]
          }
        />

        {/* المقاس (اختياري) */}
        <TextInput
          label="المقاس (اختياري)"
          name="size"
          type="text"
          placeholder="مثال: XL أو 24cm"
          value={product.size}
          onChange={handleChange}
        />

        {/* العدد (اختياري) */}
        <TextInput
          label="العدد (اختياري)"
          name="count"
          type="text"
          placeholder="مثال: 2 قطع / 12 عبوة"
          value={product.count}
          onChange={handleChange}
        />

        {/* الألوان (اختياري) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الألوان المتوفرة (اختياري — أضف لونًا واحدًا في كل مرة)
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
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-black"
            >
              إضافة لون
            </button>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {colors.map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-gray-50 text-sm"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="text-red-600 hover:text-red-700"
                    aria-label={`حذف اللون ${c}`}
                    title="حذف"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <TextInput
          label="السعر"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
        />

        {/* التحكم بالمخزون */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الكمية (المخزون)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decStock}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border"
              aria-label="تقليل الكمية"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={product.stock}
              onChange={(e) => setSafeStock(e.target.value)}
              className="add-product-InputCSS w-28 text-center"
            />
            <button
              type="button"
              onClick={incStock}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border"
              aria-label="زيادة الكمية"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">الحد الأدنى 1 عند الإضافة.</p>
        </div>

        <UploadImage name="image" id="image" uploaded={image} setImage={setImage} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="add-product-InputCSS"
            value={product.description}
            placeholder="اكتب وصف المنتج"
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isLoading}>
            {isLoading ? 'جاري الإضافة...' : 'أضف منتج'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
