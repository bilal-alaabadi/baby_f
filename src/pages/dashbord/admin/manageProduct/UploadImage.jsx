// ========================= src/pages/dashbord/admin/updateProduct/UploadImage.jsx =========================
import React, { useEffect, useState } from 'react';

/**
 * وضع "التعديل" فقط:
 *  - initialImages: string[]  => صور المنتج الحالية (روابط)
 *  - setImages: (files: File[]) => يرجّع الملفات الجديدة للأب (لرفعها عند الحفظ)
 *  - setKeepImages: (urls: string[]) => يُحدّث قائمة الصور المُبقاة بعد الحذف
 */
const UploadImag = ({ name, id, initialImages = [], setImages, setKeepImages }) => {
  const [currentImages, setCurrentImages] = useState([]); // روابط حالية
  const [newFiles, setNewFiles] = useState([]);           // ملفات جديدة
  const [newPreviews, setNewPreviews] = useState([]);     // معاينات

  useEffect(() => {
    const curr = Array.isArray(initialImages) ? initialImages : [];
    setCurrentImages(curr);
    if (typeof setKeepImages === 'function') setKeepImages(curr);
  }, [initialImages, setKeepImages]);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const updatedFiles = [...newFiles, ...files];
    setNewFiles(updatedFiles);
    if (typeof setImages === 'function') setImages(updatedFiles);

    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  const removeCurrentImage = (url) => {
    const updated = currentImages.filter((u) => u !== url);
    setCurrentImages(updated);
    if (typeof setKeepImages === 'function') setKeepImages(updated);
  };

  const removeNewFileByIndex = (idx) => {
    const updatedFiles = newFiles.filter((_, i) => i !== idx);
    setNewFiles(updatedFiles);
    if (typeof setImages === 'function') setImages(updatedFiles);

    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="text-right">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        الصور
      </label>

      {/* الصور الحالية */}
      {currentImages.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">الصور الحالية (يمكنك حذف أي صورة):</p>
          <div className="flex flex-wrap gap-3">
            {currentImages.map((url, idx) => (
              <div key={`curr-${idx}`} className="relative">
                <img
                  src={url}
                  alt={`current-${idx}`}
                  className="w-24 h-24 object-cover rounded border"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100')}
                />
                <button
                  type="button"
                  onClick={() => removeCurrentImage(url)}
                  className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center shadow"
                  aria-label="حذف الصورة"
                  title="حذف الصورة"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* اختيار ملفات جديدة */}
      <input
        type="file"
        accept="image/*"
        multiple
        name={name}
        id={id}
        onChange={handleFilesChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 hover:file:bg-gray-200"
      />

      {/* معاينة الصور الجديدة */}
      {newPreviews.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-1">معاينة الصور الجديدة (يمكنك إزالة أي صورة قبل الحفظ):</p>
          <div className="flex flex-wrap gap-3">
            {newPreviews.map((src, idx) => (
              <div key={`new-${idx}`} className="relative">
                <img
                  src={src}
                  alt={`new-${idx}`}
                  className="w-24 h-24 object-cover rounded border"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100')}
                />
                <button
                  type="button"
                  onClick={() => removeNewFileByIndex(idx)}
                  className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center shadow"
                  aria-label="إزالة الصورة"
                  title="إزالة الصورة"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImag;
