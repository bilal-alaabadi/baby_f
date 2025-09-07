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
    stock: 1, // 👈 الكمية الافتراضية
  });

  const [image, setImage] = useState([]); // UploadImage يملأها
  const [addProduct, { isLoading, error }] = useAddProductMutation();
  const navigate = useNavigate();

  // إعادة ضبط النوع عند تغيير الفئة الرئيسية
  useEffect(() => {
    setProduct((prev) => ({ ...prev, category: '' }));
  }, [product.mainCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // تحكم آمن بالكمية
  const setSafeStock = (val) => {
    const n = Number.isNaN(Number(val)) ? 0 : Math.floor(Number(val));
    const clamped = Math.max(0, n);
    setProduct((prev) => ({ ...prev, stock: clamped }));
  };

  const incStock = () => setSafeStock((product.stock || 0) + 1);
  const decStock = () => setSafeStock((product.stock || 0) - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      'أسم المنتج': product.name,
      'الفئة الرئيسية': product.mainCategory,
      'النوع': product.category,
      'السعر': product.price,
      'الوصف': product.description,
      'الصور': image.length > 0,
      // نشترط >= 1 حتى يكون هناك مخزون فعلي
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
      });
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

        <UploadImage name="image" id="image" setImage={setImage} />

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
