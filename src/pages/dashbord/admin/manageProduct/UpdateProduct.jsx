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

  const [image, setImage] = useState([]);

  // تفعيل/تعطيل عدد القطع + الألوان
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const [colorsEnabled, setColorsEnabled] = useState(false);

  // خيارات عدد القطع (name=count, price, stock)
  const [options, setOptions] = useState([{ name: '', price: '', stock: '' }]);

  // ألوان بمخزون (color, stock)
  const [colorRows, setColorRows] = useState([{ color: '', stock: '' }]);

  // ألوان نصية للتوافق (في حال عدم تفعيل الألوان)
  const [colorsSimple, setColorsSimple] = useState([]);
  const [colorInput, setColorInput] = useState('');

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

    // الصور
    setImage(Array.isArray(p?.image) ? p.image : (p?.image ? [p.image] : []));

    // countPrices
    const cps = Array.isArray(p?.countPrices) ? p.countPrices : [];
    if (cps.length > 0) {
      setOptionsEnabled(true);
      setOptions(
        cps.map(cp => ({
          name: String(cp?.count ?? ''),
          price: cp?.price != null ? String(cp.price) : '',
          stock: (cp?.stock != null && cp?.stock !== '') ? String(cp.stock) : '',
        }))
      );
    } else {
      setOptionsEnabled(false);
      setOptions([{ name: '', price: '', stock: '' }]);
    }

    // colors + colorsStock
    const cs = Array.isArray(p?.colorsStock) ? p.colorsStock : [];
    if (cs.length > 0) {
      setColorsEnabled(true);
      setColorRows(
        cs.map(x => ({
          color: String(x?.color ?? ''),
          stock: (x?.stock != null && x?.stock !== '') ? String(x.stock) : '',
        }))
      );
      setColorsSimple((p?.colors || []).map(c => String(c)).filter(Boolean));
    } else {
      setColorsEnabled(false);
      setColorRows([{ color: '', stock: '' }]);
      const initialColors = Array.isArray(p?.colors) ? p.colors : [];
      setColorsSimple(initialColors);
    }
  }, [productData]);

  // تغيير حقول المنتج
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mainCategory') {
      setProduct((prev) => ({ ...prev, mainCategory: value, category: '' }));
      return;
    }
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // مخزون عام (للحالة العادية)
  const setSafeStock = (val) => {
    const n = Number.isNaN(Number(val)) ? 0 : Math.floor(Number(val));
    const clamped = Math.max(0, n);
    setProduct((prev) => ({ ...prev, stock: clamped }));
  };
  const incStock = () => setSafeStock((product.stock || 0) + 1);
  const decStock = () => setSafeStock((product.stock || 0) - 1);

  // ألوان نصية للحالة العادية
  const addColorSimple = () => {
    const c = (colorInput || '').trim();
    if (!c) return;
    if (colorsSimple.some(x => x.toLowerCase() === c.toLowerCase())) { setColorInput(''); return; }
    setColorsSimple(prev => [...prev, c]);
    setColorInput('');
  };
  const removeColorSimple = (idx) => setColorsSimple(prev => prev.filter((_, i) => i !== idx));
  const handleKeyDownOnColor = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addColorSimple(); }
  };

  // إدارة خيارات عدد القطع
  const addOption = () => setOptions(prev => [...prev, { name: '', price: '', stock: '' }]);
  const removeOption = (idx) => setOptions(prev => prev.filter((_, i) => i !== idx));
  const updateOption = (idx, field, value) =>
    setOptions(prev => prev.map((opt, i) => (i === idx ? { ...opt, [field]: value } : opt)));

  // إدارة الألوان بمخزون
  const addColorRow = () => setColorRows(prev => [...prev, { color: '', stock: '' }]);
  const removeColorRow = (idx) => setColorRows(prev => prev.filter((_, i) => i !== idx));
  const updateColorRow = (idx, field, value) =>
    setColorRows(prev => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  // أقل سعر خيار
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
    };

    // تحقق السعر
    if (!optionsEnabled) {
      requiredBase['السعر'] = product.price;
    } else {
      if (options.length === 0) {
        alert('أضف خيارًا واحدًا على الأقل.');
        return;
      }
      const invalidOpt = options.some(o =>
        !o.name?.trim() ||
        o.price === '' || Number.isNaN(Number(o.price)) || Number(o.price) < 0 ||
        o.stock === '' || Number.isNaN(Number(o.stock)) || Number(o.stock) < 0
      );
      if (invalidOpt) {
        alert('لكل خيار: الاسم + السعر + المخزون (>=0) مطلوبين.');
        return;
      }
    }

    // تحقق المخزون
    if (!optionsEnabled && !colorsEnabled) {
      requiredBase['الكمية (المخزون)'] = Number(product.stock) >= 0;
    }
    if (colorsEnabled) {
      const invalidColor = colorRows.some(r =>
        !String(r.color || '').trim() ||
        r.stock === '' || Number.isNaN(Number(r.stock)) || Number(r.stock) < 0
      );
      if (invalidColor) {
        alert('لكل لون: الاسم + المخزون (>=0) مطلوبان.');
        return;
      }
    }

    const missing = Object.entries(requiredBase).filter(([_, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      alert(`الرجاء ملء/تصحيح الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    try {
      // السعر المطلوب إرساله
      const priceToSend = optionsEnabled
        ? Number(minOptionPrice ?? 0)
        : Number(product.price);

      // countPrices — مهم: أرسل undefined إذا القسم غير مفعّل حتى لا يُحسب 0 بالخلفية
      const countPrices = optionsEnabled
        ? options.map(o => ({
            count: String(o.name).trim(),
            price: Number(o.price),
            stock: Math.max(0, Math.floor(Number(o.stock))),
          }))
        : undefined;

      // colorsStock
      const colorsStockPayload = colorsEnabled
        ? colorRows.map(r => ({
            color: String(r.color).trim(),
            stock: Math.max(0, Math.floor(Number(r.stock))),
          }))
        : undefined;

      // colors (أسماء فقط للتوافق والبحث)
      const colorsNames = colorsEnabled
        ? colorsStockPayload.map(x => x.color)
        : colorsSimple;

      // حساب المخزون النهائي في الواجهة (للعرض/الاتساق فقط)
      const totalCountStock = optionsEnabled
        ? countPrices.reduce((s, o) => s + (o.stock || 0), 0)
        : null;

      const totalColorsStock = colorsEnabled
        ? colorsStockPayload.reduce((s, c) => s + (c.stock || 0), 0)
        : null;

      const finalStock = (() => {
        if (optionsEnabled && colorsEnabled) {
          return Math.min(totalCountStock || 0, totalColorsStock || 0);
        } else if (optionsEnabled) {
          return totalCountStock || 0;
        } else if (colorsEnabled) {
          return totalColorsStock || 0;
        } else {
          return Math.max(0, Math.floor(Number(product.stock || 0)));
        }
      })();

      await updateProduct({
        id,
        body: {
          name: product.name,
          mainCategory: product.mainCategory,
          category: product.category,
          description: product.description,
          price: priceToSend,
          oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
          image,
          author: user?._id,

          stock: finalStock,

          size: String(product.size ?? ''),
          count: String(product.count ?? ''),

          colors: colorsNames,
          colorsStock: colorsStockPayload,       // undefined إذا غير مفعّل
          countPrices,                           // undefined إذا غير مفعّل (هذا هو التعديل المهم)
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
      <h2 className="text-2xl font-bold mb-6">تحديث المنتج</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* مفاتيح الحالات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="font-medium">تفعيل قسم عدد القطع</div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={optionsEnabled}
                onChange={(e) => setOptionsEnabled(e.target.checked)}
              />
              <span className="text-sm">{optionsEnabled ? 'مفعّل' : 'غير مفعّل'}</span>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="font-medium">تفعيل الألوان</div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={colorsEnabled}
                onChange={(e) => setColorsEnabled(e.target.checked)}
              />
              <span className="text-sm">{colorsEnabled ? 'مفعّل' : 'غير مفعّل'}</span>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="font-medium">الوضع الحالي</div>
            <div className="text-xs">
              {optionsEnabled && colorsEnabled
                ? 'ألوان + عدد القطع (بدون ربط)'
                : optionsEnabled
                  ? 'عدد القطع فقط'
                  : colorsEnabled
                    ? 'الألوان فقط'
                    : 'عادي'}
            </div>
          </div>
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

        {/* السعر العام: يظهر فقط إذا عدد القطع غير مفعّل */}
        {!optionsEnabled && (
          <>
            <TextInput label="السعر القديم (اختياري)" name="oldPrice" type="number" min="0" step="0.01" placeholder="100" value={product.oldPrice} onChange={handleChange} />
            <TextInput label="السعر" name="price" type="number" min="0" step="0.01" placeholder="50" value={product.price} onChange={handleChange} />
          </>
        )}

        {/* المخزون العام: يظهر فقط في الحالة العادية */}
        {!optionsEnabled && !colorsEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية (المخزون)</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={decStock} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border" aria-label="تقليل الكمية">−</button>
              <input type="number" inputMode="numeric" min="0" step="1" value={product.stock} onChange={(e) => setSafeStock(e.target.value)} className="add-product-InputCSS w-28 text-center" />
              <button type="button" onClick={incStock} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border" aria-label="زيادة الكمية">+</button>
            </div>
          </div>
        )}

        {/* عدد القطع */}
        {optionsEnabled && (
          <div className="space-y-3 p-3 border rounded-lg bg-slate-800/5">
            <div className="flex items-center justify-between">
              <span className="font-medium">قسم عدد القطع</span>
              <button type="button" onClick={addOption} className="text-sm px-3 py-1 rounded-md border bg-gray-100 hover:bg-gray-200">إضافة خيار +</button>
            </div>

            {options.map((opt, idx) => (
              <div key={idx} className="rounded-lg border p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">عدد القطع</label>
                    <input type="text" className="add-product-InputCSS w-full" placeholder="مثال: 32 قطعة" value={opt.name} onChange={(e) => updateOption(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">سعر الخيار</label>
                    <input type="number" min="0" step="0.01" className="add-product-InputCSS w-full" placeholder="مثال: 6.89" value={opt.price} onChange={(e) => updateOption(idx, 'price', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">مخزون هذا العدد</label>
                    <input type="number" min="0" step="1" className="add-product-InputCSS w-full" placeholder="مثال: 10" value={opt.stock} onChange={(e) => updateOption(idx, 'stock', e.target.value)} />
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

        {/* الألوان بمخزون */}
        {colorsEnabled && (
          <div className="space-y-3 p-3 border rounded-lg bg-slate-800/5">
            <div className="flex items-center justify-between">
              <span className="font-medium">قسم الألوان</span>
              <button type="button" onClick={addColorRow} className="text-sm px-3 py-1 rounded-md border bg-gray-100 hover:bg-gray-200">إضافة لون +</button>
            </div>

            {colorRows.map((row, idx) => (
              <div key={idx} className="rounded-lg border p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">اسم اللون</label>
                    <input type="text" className="add-product-InputCSS w-full" placeholder="مثال: أحمر" value={row.color} onChange={(e) => updateColorRow(idx, 'color', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">مخزون هذا اللون</label>
                    <input type="number" min="0" step="1" className="add-product-InputCSS w-full" placeholder="مثال: 15" value={row.stock} onChange={(e) => updateColorRow(idx, 'stock', e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => removeColorRow(idx)} className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600">حذف اللون</button>
                </div>
              </div>
            ))}
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
