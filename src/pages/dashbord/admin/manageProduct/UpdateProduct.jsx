import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchProductByIdQuery, useUpdateProductMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
import UploadImage from '../addProduct/UploadImage';

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

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: productData, isLoading: isFetching, error: fetchError } = useFetchProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [product, setProduct] = useState({
    name: '',
    mainCategory: '',
    category: '',
    price: '',
    oldPrice: '',
    description: '',
    image: [],
    stock: '', // 👈 جديد
  });

  // صور جديدة (اختيارية) — إن أرسلت نستبدل بها، وإن لا تُرسل نترك القديمة كما هي
  const [newImages, setNewImages] = useState([]);

  // تعبئة البيانات الواردة من الـ API
  useEffect(() => {
    if (productData) {
      setProduct({
        name: productData.name || '',
        mainCategory: productData.mainCategory || '',
        category: productData.category || '',
        price: productData.price?.toString() || '',
        oldPrice: productData.oldPrice?.toString() || '',
        description: productData.description || '',
        image: productData.image || [],
        stock: productData.stock !== undefined && productData.stock !== null
          ? String(productData.stock)
          : '0', // 👈 تعبئة المخزون (افتراضي 0 إن لم يصل)
      });
    }
  }, [productData]);

  // عند تغيير الفئة الرئيسية نفرغ النوع
  useEffect(() => {
    setProduct((prev) => ({ ...prev, category: '' }));
  }, [product.mainCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // منع إدخال قيم سالبة في المخزون والسعرين من الواجهة
    if ((name === 'stock' || name === 'price' || name === 'oldPrice') && Number(value) < 0) {
      setProduct(prev => ({ ...prev, [name]: '0' }));
      return;
    }

    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      'أسم المنتج': product.name,
      'الفئة الرئيسية': product.mainCategory,
      'النوع': product.category,
      'السعر': product.price,
      'الوصف': product.description,
      'المخزون': product.stock, // 👈 التحقق من وجود قيمة للمخزون
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === '' || value === null || value === undefined)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      alert(`الرجاء ملء الحقول التالية: ${missingFields.join('، ')}`);
      return;
    }

    // تحقق رقمي
    const priceNum = Number(product.price);
    const oldPriceNum = product.oldPrice !== '' ? Number(product.oldPrice) : '';
    const stockNum = Number(product.stock);

    if (Number.isNaN(priceNum) || priceNum < 0) {
      alert('السعر غير صالح');
      return;
    }
    if (oldPriceNum !== '' && (Number.isNaN(oldPriceNum) || oldPriceNum < 0)) {
      alert('السعر القديم غير صالح');
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0 || !Number.isFinite(stockNum)) {
      alert('قيمة المخزون غير صالحة');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('mainCategory', product.mainCategory);
      formData.append('category', product.category);
      formData.append('price', String(priceNum));
      formData.append('oldPrice', product.oldPrice === '' ? '' : String(oldPriceNum));
      formData.append('description', product.description);
      formData.append('author', user._id);
      formData.append('stock', String(Math.floor(stockNum))); // 👈 إرسال المخزون

      // صور جديدة (اختيارية). إذا لم تُرسل، الباك سيُبقي الصور القديمة كما هي
      if (newImages.length > 0) {
        newImages.forEach(img => formData.append('image', img));
      }

      await updateProduct({ id, body: formData }).unwrap();
      alert('تم تحديث المنتج بنجاح');
      navigate("/dashboard/manage-products");
    } catch (error) {
      console.error("فشل تحديث المنتج:", error);
      alert('حدث خطأ أثناء تحديث المنتج: ' + (error?.data?.message || error.message));
    }
  };

  if (isFetching) return <div className="text-center py-8">جاري تحميل بيانات المنتج...</div>;
  if (fetchError) return <div className="text-center py-8 text-red-500">خطأ في تحميل بيانات المنتج</div>;

  return (
    <div className="container mx-auto mt-8 px-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-right">تحديث المنتج</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="أكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="الفئة الرئيسية"
          name="mainCategory"
          value={product.mainCategory}
          onChange={handleChange}
          options={mainCategories}
          required
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
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="السعر الحالي"
            name="price"
            type="number"
            placeholder="50"
            value={product.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />

          <TextInput
            label="السعر القديم (اختياري)"
            name="oldPrice"
            type="number"
            placeholder="100"
            value={product.oldPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
          />

          {/* 👇 حقل المخزون الجديد */}
          <TextInput
            label="الكمية في المخزون"
            name="stock"
            type="number"
            placeholder="0"
            value={product.stock}
            onChange={handleChange}
            required
            min="0"
            step="1"
          />
        </div>

        <UploadImage
          name="image"
          id="image"
          initialImages={product.image}
          setImages={setNewImages}
        />

        <div className="text-right">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={product.description}
            placeholder="أكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
