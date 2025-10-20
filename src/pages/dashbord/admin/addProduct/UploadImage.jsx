// ========================= src/components/products/UploadImage.jsx =========================
import React, { useState } from 'react';
import axios from 'axios';
import { getBaseUrl } from '../../../../utils/baseURL';

/**
 * خاص بصفحة الإضافة:
 * - كل اختيار جديد للصور يُرفع فورًا إلى /api/products/uploadImages ويُضاف فوق السابق (لا يستبدله).
 * - تستطيع حذف أي صورة قبل إرسال المنتج.
 *
 * Props:
 * - name, id
 * - uploaded: string[]   قائمة الروابط الحالية (من الأب) لعرضها
 * - setImage: (urls: string[]) => void  لتحديث القائمة في الأب
 */
const UploadImage = ({ name, id, uploaded = [], setImage }) => {
  const [loading, setLoading] = useState(false);

  // تحويل ملف إلى Base64 (Data URL)
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => resolve(r.result);
      r.onerror = (err) => reject(err);
    });

  // عند اختيار ملفات: نرفعها ونضيف الروابط فوق الحالية
  const handleAddFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setLoading(true);
    try {
      const base64Images = await Promise.all(files.map(fileToBase64));

      const resp = await axios.post(
        // غيّر للمسار الصحيح عندك لو مختلف (مثلاً: `${getBaseUrl()}/uploadImages`)
        `${getBaseUrl()}/api/products/uploadImages`,
        { images: base64Images },
        {
          headers: { 'Content-Type': 'application/json' },
          maxBodyLength: Infinity, // مفيد للصور الكبيرة
        }
      );

      const urls = Array.isArray(resp.data) ? resp.data : [];

      // دمج الروابط الجديدة مع القديمة بدون تكرار وبلا useEffect (تجنّب لوب التحديث)
      setImage((prev) => {
        const merged = [...prev, ...urls];
        return Array.from(new Set(merged));
      });

      // للسماح بإعادة اختيار نفس الملف مرة ثانية لو حبيت
      e.target.value = '';
    } catch (err) {
      console.error('Error uploading images:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'حدث خطأ أثناء تحميل الصور!';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // حذف صورة قبل الإرسال النهائي
  const removeImage = (idx) => {
    setImage((prev) => prev.filter((_, i) => i !== idx));
  };

  // ====== الإضافة الجديدة: تعديل "رقم الصورة" لإعادة ترتيبها ======

  // نقل عنصر من فهرس لآخر داخل مصفوفة (آمن على الحدود)
  const moveItem = (arr, fromIdx, toIdx) => {
    const copy = [...arr];
    const from = Math.max(0, Math.min(copy.length - 1, fromIdx));
    const to = Math.max(0, Math.min(copy.length - 1, toIdx));
    if (from === to) return copy;
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  };

  // عند تعديل رقم الصورة (1-مبني للمستخدم)
  const handleChangePosition = (currentIdx, newPosInput) => {
    // حوّل المُدخل لعدد صحيح، واخضعه للحدود [1 .. uploaded.length]
    const raw = Number(newPosInput);
    if (!Number.isFinite(raw)) return;
    const bounded = Math.max(1, Math.min(uploaded.length, Math.trunc(raw)));

    // حوّل لِـ 0-index قبل التحريك
    const targetIdx = bounded - 1;

    setImage((prev) => moveItem(prev, currentIdx, targetIdx));
  };

  return (
    <div className="text-right">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        الصور
      </label>

      <input
        type="file"
        accept="image/*"
        multiple
        name={name}
        id={id}
        onChange={handleAddFiles}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 hover:file:bg-gray-200"
      />

      {loading && <div className="mt-2 text-sm text-blue-600">جاري تحميل الصور...</div>}

      {uploaded.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-1">
            الصور المختارة (تستطيع حذف أي صورة قبل إضافة المنتج) — ويمكنك تعديل <span className="font-semibold">رقم الصورة</span> لإعادة ترتيبها:
          </p>

          <div className="flex flex-wrap gap-3">
            {uploaded.map((url, idx) => (
              <div key={`upl-${idx}`} className="relative">
                <img
                  src={url}
                  alt={`uploaded-${idx}`}
                  className="w-24 h-24 object-cover rounded border"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100')}
                />

                {/* زر الحذف (موجود مسبقًا) */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center shadow"
                  aria-label="حذف الصورة"
                  title="حذف الصورة"
                >
                  ×
                </button>

                {/* ====== الجديد: مُدخل تعديل رقم الصورة ====== */}
                <div className="mt-1 flex items-center justify-between">
                  <label className="text-[11px] text-gray-600 ml-2" htmlFor={`pos-${idx}`}>
                    رقم الصورة
                  </label>
                  <input
                    id={`pos-${idx}`}
                    type="number"
                    min={1}
                    max={uploaded.length}
                    value={idx + 1}
                    onChange={(e) => handleChangePosition(idx, e.target.value)}
                    className="w-16 h-7 text-center text-xs border rounded-md border-gray-300 focus:outline-none"
                    title="غيّر هذا الرقم لإعادة ترتيب الصورة"
                    aria-label={`تعديل ترتيب الصورة رقم ${idx + 1}`}
                  />
                </div>
                {/* ============================================ */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
