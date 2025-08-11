import React, { useState } from 'react';
import axios from 'axios';
import { getBaseUrl } from '../../../../utils/baseURL';

const UploadImage = ({ name, setImage }) => {
    const [loading, setLoading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState([]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0); // حالة لتتبع الصورة الرئيسية

    // دالة لتحويل الملف إلى base64
    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    // دالة لتحميل الصور
    const uploadImages = async (event) => {
        const files = event.target.files;
        if (files.length === 0) return;

        setLoading(true);

        try {
            // تحويل الملفات إلى base64
            const base64Images = await Promise.all(
                Array.from(files).map((file) => convertBase64(file))
            );

            // إرسال الصور إلى الخادم
            const response = await axios.post(`${getBaseUrl()}/uploadImages`, { images: base64Images });
            const uploadedUrls = response.data;

            setUploadedUrls(uploadedUrls);
            setImage(uploadedUrls);
            setPrimaryImageIndex(0); // تعيين أول صورة كصورة رئيسية افتراضياً
            alert("تم تحميل الصور بنجاح!");
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("حدث خطأ أثناء تحميل الصور!");
        } finally {
            setLoading(false);
        }
    };

    // دالة لتغيير الصورة الرئيسية
    const setAsPrimary = (index) => {
        setPrimaryImageIndex(index);
        
        // إعادة ترتيب الصور بحيث تكون الصورة المختارة أولاً
        const reorderedUrls = [
            uploadedUrls[index],
            ...uploadedUrls.slice(0, index),
            ...uploadedUrls.slice(index + 1)
        ];
        
        setUploadedUrls(reorderedUrls);
        setImage(reorderedUrls); // إرسال الترتيب الجديد إلى الدالة الأب
    };

    return (
        <div>
            <label htmlFor={name}>تحميل الصور</label>
            <input
                type="file"
                name={name}
                id={name}
                onChange={uploadImages}
                className="add-product-InputCSS"
                multiple
            />
            {loading && (
                <div className="mt-2 text-sm text-blue-600">جاري تحميل الصور...</div>
            )}
            {uploadedUrls.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm text-green-600">
                        الصورة الرئيسية: <span className="font-bold">الصورة {primaryImageIndex + 1}</span>
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {uploadedUrls.map((url, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={url}
                                    alt={`uploaded-image-${index}`}
                                    className={`w-24 h-24 object-cover rounded border-2 ${
                                        index === primaryImageIndex 
                                            ? 'border-blue-500' 
                                            : 'border-transparent'
                                    }`}
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/100";
                                        e.target.alt = "Image not found";
                                    }}
                                />
                                {index !== primaryImageIndex && (
                                    <button
                                        onClick={() => setAsPrimary(index)}
                                        className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs font-bold hidden group-hover:flex items-center justify-center rounded"
                                    >
                                        تعيين كرئيسية
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadImage;