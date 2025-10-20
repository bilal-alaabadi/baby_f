// ========================= src/components/admin/updateProduct/UpdateProduct.jsx =========================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchProductByIdQuery, useUpdateProductMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
import UploadImage from '../addProduct/UploadImage';

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
    stock: 1,
    size: '',
    count: '',
  });

  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [image, setImage] = useState([]);

  const [optionsEnabled, setOptionsEnabled] = useState(true);
  const [options, setOptions] = useState([{ name: '', price: '', stock: '' }]);

  // ✅ تفعيل/إلغاء الألوان
  const [colorsEnabled, setColorsEnabled] = useState(true);

  useEffect(() => {
    if (!productData) return;
    const p = productData;

    setProduct({
      name: p?.name || '',
      mainCategory: p?.mainCategory || '',
      category: p?.category || '',
      price: p?.price != null ? String(p.price) : '',
      oldPrice: p?.oldPrice != null ? String(p.oldPrice) : '',
      description: p?.description || '',
      stock: p?.stock != null ? Number(p.stock) : 1,
      size: p?.size || '',
      count: p?.count || '',
    });

    const initialColors = Array.isArray(p?.colors) ? p.colors : [];
    setColors(initialColors);
    setColorsEnabled(initialColors.length > 0); // تفعيل الألوان تلقائياً إن وُجدت

    setImage(Array.isArray(p?.image) ? p.image : (p?.image ? [p.image] : []));

    const cps = Array.isArray(p?.countPrices) ? p.countPrices : [];
    if (cps.length > 0) {
      setOptionsEnabled(true);
      setOptions(
        cps.map(cp => ({
          name: String(cp?.count ?? ''),
          price: cp?.price != null ? String(cp.price) : '',
          stock: cp?.stock != null ? String(cp.stock) : '',
        }))
      );
    } else {
      setOptionsEnabled(false);
      setOptions([{ name: '', price: '', stock: '' }]);
    }
  }, [productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mainCategory') {
      setProduct((prev) => ({ ...prev, mainCategory: value, category: '' }));
      return;
    }
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
    if (exists) { setColorInput(''); return; }
    setColors(prev => [...prev, c]);
    setColorInput('');
  };
  const removeColor = (idx) => setColors(prev => prev.filter((_, i) => i !== idx));
  const handleKeyDownOnColor = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addColor(); }
  };

  const addOption = () => setOptions(prev => [...prev, { name: '', price: '', stock: '' }]);
  const removeOption = (idx) => setOptions(prev => prev.filter((_, i) => i !== idx));
  const updateOption = (idx, field, value) =>
    setOptions(prev => prev.map((opt, i) => (i === idx ? { ...opt, [field]: value } : opt)));

  const minOptionPrice = useMemo(() => {
    const nums = options.map(o => Number(o.price)).filter(v => !Number.isNaN(v));
    if (!nums.length) return null;
    return Math.min(...nums);
  }, [options]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredBase = {
      'أسم المنتج': product.name,
      'الفئة الرئيسية': product.mainCategory,
      'النوع': product.category,
      'الوصـف': product.description,
      'الصور': image.length > 0,
      'الكمية (المخزون)': Number(product.stock) >= 1,
    };

    if (!optionsEnabled) {
      requiredBase['السعر'] = product.price;
    } else {
      if (options.length === 0) {
        alert('أضف خيارًا واحدًا على الأقل.');
        return;
      }
      const bad = options.some(o =>
        !o.name?.trim() ||
        o.price === '' ||
        Number.isNaN(Number(o.price)) ||
        Number(o.price) < 0 ||
        (o.stock !== '' && (Number.isNaN(Number(o.stock)) || Number(o.stock) < 0))
      );
      if (bad) {
        alert('تحقق من اسم الخيار وسعره (والمخزون إن وُجد).');
        return;
      }
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
            stock: (o.stock === '' || o.stock === null) ? undefined : Math.floor(Number(o.stock))
          }))
        : [];

      const anyOptionHasStock = optionsEnabled && countPrices.some(x => typeof x.stock === 'number');
      const totalOptionStock = anyOptionHasStock
        ? countPrices
            .map(x => (typeof x.stock === 'number' && x.stock >= 0 ? x.stock : 0))
            .reduce((a, b) => a + b, 0)
        : null;

      // إرسال الألوان وفق حالة التفعيل/الإلغاء
      const colorsToSend = colorsEnabled ? colors : [];

      await updateProduct({
        id,
        body: {
          ...product,
          price: priceToSend,
          oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
          stock: anyOptionHasStock ? totalOptionStock : Number(product.stock),

          // ✅ مهم: أرسل دائمًا size و count حتى لو فارغين
          // ليتحوّلا إلى null في الباك إند (وبكذا يُحذف/يتغيّر فعلاً)
          size: String(product.size ?? ''),
          count: String(product.count ?? ''),

          colors: colorsToSend,
          image,
          author: user?._id,
          countPrices,
        }
      }).unwrap();

      alert('تم تحديث المنتج بنجاح');
      navigate('/shop');
    } catch (error) {
      alert('حدث خطأ أثناء تحديث المنتج: ' + (error?.data?.message || error?.message || 'خطأ غير معروف'));
    }
  };

  if (isFetching) return <div className="text-center py-8">جاري تحميل بيانات المنتج...</div>;
  if (fetchError) return <div className="text-center py-8 text-red-500">خطأ في تحميل بيانات المنتج</div>;

  return (
    <div className="container mx-auto mt-8" dir="rtl">
      <h2 className="text-٢xl font-bold mb-6">تحديث المنتج</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* <TextInput label="العدد (اختياري)" name="count" type="text" placeholder="مثال: 2 قطع / 12 عبوة" value={product.count} onChange={handleChange} /> */}

        {/* الكمية (المخزون) — يظهر دائمًا */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الكمية (المخزون)</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={decStock} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border" aria-label="تقليل الكمية">−</button>
            <input type="number" inputMode="numeric" min="0" step="1" value={product.stock} onChange={(e) => setSafeStock(e.target.value)} className="add-product-InputCSS w-28 text-center" />
            <button type="button" onClick={incStock} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border" aria-label="زيادة الكمية">+</button>
          </div>
          <p className="text-xs text-gray-500 mt-1">الحد الأدنى 1 عند الإضافة/التحديث.</p>
        </div>

        {!optionsEnabled && (
          <>
            {/* <TextInput label="السعر القديم (اختياري)" name="oldPrice" type="number" min="0" step="0.01" placeholder="100" value={product.oldPrice} onChange={handleChange} /> */}
            <TextInput label="السعر" name="price" type="number" min="0" step="0.01" placeholder="50" value={product.price} onChange={handleChange} />
          </>
        )}

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
                    <input type="text" className="add-product-InputCSS w-full" placeholder="مثال: حِفَض جونيور 32 قطعة" value={opt.name} onChange={(e) => updateOption(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">سعر الخيار</label>
                    <input type="number" min="0" step="0.01" className="add-product-InputCSS w-full" placeholder="مثال: 6.89" value={opt.price} onChange={(e) => updateOption(idx, 'price', e.target.value)} />
                  </div>
                  {/* مخزون الخيار (اختياري) — ارفعه من التعليق إذا رغبت بإدخاله من الواجهة */}
                  {/* <div>
                    <label className="block text-sm mb-1">(اختياري) المخزون (للخيار)</label>
                    <input type="number" min="0" step="1" className="add-product-InputCSS w-full" placeholder="مثال: 10" value={opt.stock} onChange={(e) => updateOption(idx, 'stock', e.target.value)} />
                  </div> */}
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

        {/* ✅ تفعيل/إلغاء الألوان */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="font-medium">تفعيل/تعطيل الألوان</div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={colorsEnabled}
              onChange={(e) => setColorsEnabled(e.target.checked)}
            />
            <span className="text-sm">{colorsEnabled ? 'مفعّل' : 'ملغى'}</span>
          </label>
        </div>

        {colorsEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الألوان المتوفرة (اختياري — أضف لونًا واحدًا في كل مرة)</label>
            <div className="flex gap-2">
              <input type="text" className="add-product-InputCSS flex-1" placeholder="اكتب اسم اللون ثم اضغط إضافة" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={handleKeyDownOnColor} />
              <button type="button" onClick={addColor} className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-black">إضافة لون</button>
            </div>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {colors.map((c, i) => (
                  <span key={`${c}-${i}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-gray-50 text-sm">
                    {c}
                    <button type="button" onClick={() => removeColor(i)} className="text-red-600 hover:text-red-700" aria-label={`حذف اللون ${c}`} title="حذف">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <UploadImage name="image" id="image" uploaded={image} setImage={setImage} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">وصف المنتج</label>
          <textarea name="description" id="description" className="add-product-InputCSS" value={product.description} placeholder="اكتب وصف المنتج" onChange={handleChange} rows={4} />
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isUpdating}>
            {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
