import React, { useState } from 'react';
import { useDeleteOrderMutation, useGetAllOrdersQuery } from '../../../../redux/features/orders/orderApi';
import { formatDate } from '../../../../utils/formateDate';
import html2pdf from 'html2pdf.js';

const ManageOrders = () => {
    const { data: orders, error, isLoading, refetch } = useGetAllOrdersQuery();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewOrder, setViewOrder] = useState(null);
    const [deleteOrder] = useDeleteOrderMutation();

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleDeleteOder = async (orderId) => {
        try {
            await deleteOrder(orderId).unwrap();
            alert("تم حذف الطلب بنجاح");
            refetch();
        } catch (error) {
            console.error("فشل حذف الطلب:", error);
        }
    };

    const handleViewOrder = (order) => {
        setViewOrder(order);
    };

    const handleCloseViewModal = () => {
        setViewOrder(null);
    };

    const handlePrintOrder = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('order-details');
        const options = {
            margin: [10, 10],
            filename: `طلب_${viewOrder._id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().from(element).set(options).save();
    };

    const handleContactWhatsApp = (phone) => {
        if (!phone) {
            alert('رقم الهاتف غير متوفر');
            return;
        }
        
        const cleanedPhone = phone.replace(/\D/g, '');
        const itemsLines = (viewOrder.products || []).map((p) => {
            const color = p.chosenColor ? ` | اللون: ${p.chosenColor}` : '';
            const size  = p.chosenSize  ? ` | المقاس: ${p.chosenSize}`   : '';
            const count = p.chosenCount ? ` | العدد: ${p.chosenCount}`   : '';
            const opts  = `${color}${size}${count}`;
            return `- ${p.name}${opts} (${p.quantity}x ${(p.price || 0).toFixed(2)} ر.ع)`;
        }).join('\n');

        const message = `مرحباً ${viewOrder.customerName || 'عميلنا العزيز'},
        
تفاصيل طلبك رقم: ${viewOrder.orderId}
تاريخ الطلب: ${formatDate(viewOrder.createdAt)}
المجموع النهائي: ${(viewOrder.amount || 0).toFixed(2)} ر.ع

المنتجات:
${itemsLines}

الرجاء تأكيد استلامك للطلب. شكراً لثقتكم بنا!`;
        
        window.open(`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const formatPrice = (price) => {
        return (parseFloat(price) || 0).toFixed(2);
    };

    if (isLoading) return <div className="p-4 text-center">جار التحميل...</div>;
    if (error) return <div className="p-4 text-center text-red-500">لا توجد طلبات</div>;

    return (
        <div className="w-full p-2 md:p-4" dir="rtl">
            <div className="bg-white rounded-lg shadow-md p-4 w-full">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center md:text-right">إدارة الطلبات</h2>
                
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-3">
                    {orders?.length > 0 ? (
                        orders.map((order, index) => (
                            <div key={index} className="border rounded-lg p-3 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500">العميل: {order?.customerName || order?.email || 'غير موجود'}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-500">{formatDate(order?.updatedAt)}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        className="text-blue-500 hover:underline text-xs px-2 py-1 border border-blue-200 rounded"
                                        onClick={() => handleViewOrder(order)}
                                    >
                                        عرض التفاصيل
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline text-xs px-2 py-1 border border-red-200 rounded"
                                        onClick={() => handleDeleteOder(order?._id)}
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            لا توجد طلبات متاحة
                        </div>
                    )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block w-full overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-right w-1/6">رقم الطلب</th>
                                <th className="py-3 px-4 border-b text-right w-2/6">العميل</th>
                                <th className="py-3 px-4 border-b text-right w-1/6">التاريخ</th>
                                <th className="py-3 px-4 border-b text-right w-2/6">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders?.length > 0 ? (
                                orders.map((order, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="py-3 px-4 border-b">{order?.orderId || '--'}</td>
                                        <td className="py-3 px-4 border-b">{order?.customerName || order?.email || 'غير موجود'}</td>
                                        <td className="py-3 px-4 border-b">{formatDate(order?.updatedAt)}</td>
                                        <td className="py-3 px-4 border-b">
                                            <div className="flex gap-3 justify-end">
                                                <button
                                                    className="text-blue-500 hover:underline text-sm px-3 py-1 border border-blue-200 rounded"
                                                    onClick={() => handleViewOrder(order)}
                                                >
                                                    عرض التفاصيل
                                                </button>
                                                <button
                                                    className="text-red-500 hover:underline text-sm px-3 py-1 border border-red-200 rounded"
                                                    onClick={() => handleDeleteOder(order?._id)}
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-gray-500">
                                        لا توجد طلبات متاحة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Order Details Modal */}
                {viewOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
                        <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto print-modal" id="order-details" dir="rtl">
                            <style>
                                {`
                                    @media print {
                                        body * {
                                            visibility: hidden;
                                        }
                                        .print-modal, .print-modal * {
                                            visibility: visible;
                                        }
                                        .print-modal {
                                            position: absolute;
                                            left: 0;
                                            top: 0;
                                            width: 100%;
                                            max-width: 100%;
                                            box-shadow: none;
                                            border: none;
                                            padding: 20px;
                                        }
                                        .print-modal button {
                                            display: none;
                                        }
                                        .print-header {
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            margin-bottom: 20px;
                                            border-bottom: 1px solid #eee;
                                            padding-bottom: 10px;
                                        }
                                        .invoice-title {
                                            font-size: 24px;
                                            font-weight: bold;
                                            color: #333;
                                        }
                                        .invoice-meta {
                                            text-align: left;
                                        }
                                    }
                                `}
                            </style>
                            
                            <div className="print-header">
                                <div>
                                    <h1 className="invoice-title">فاتورة الطلب</h1>
                                    <p className="text-gray-600">شكراً لاختياركم متجرنا</p>
                                </div>
                                <div className="invoice-meta">
                                    <p><strong>رقم الفاتورة:</strong> #{viewOrder.orderId}</p>
                                    <p><strong>تاريخ الفاتورة:</strong> {formatDate(viewOrder.createdAt)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">معلومات العميل</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><strong>الاسم:</strong> {viewOrder.customerName || 'غير محدد'}</p>
                                        <p><strong>رقم الهاتف:</strong> {viewOrder.customerPhone || 'غير محدد'}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">معلومات التوصيل</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><strong>البلد:</strong> {viewOrder.country || 'غير محدد'}</p>
                                        <p><strong>الولاية:</strong> {viewOrder.wilayat || 'غير محدد'}</p>
                                        <p><strong>ملاحظات:</strong> {viewOrder.description || 'لا توجد ملاحظات'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">المنتجات المطلوبة</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="hidden md:block">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-2 px-3 text-right w-12">#</th>
                                                    <th className="py-2 px-3 text-right">الصورة</th>
                                                    <th className="py-2 px-3 text-right">المنتج</th>
                                                    <th className="py-2 px-3 text-right">الكمية</th>
                                                    <th className="py-2 px-3 text-right">السعر</th>
                                                    <th className="py-2 px-3 text-right">المجموع</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewOrder.products?.map((product, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="py-2 px-3 text-center">{index + 1}</td>
                                                        <td className="py-2 px-3">
                                                            <img 
                                                                src={product.image || '/images/placeholder.jpg'} 
                                                                alt={product.name || 'منتج'} 
                                                                className="w-12 h-12 object-cover rounded mx-auto"
                                                                onError={(e) => {
                                                                    e.target.src = '/images/placeholder.jpg';
                                                                    e.target.alt = 'صورة غير متوفرة';
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <div>
                                                                <p className="font-medium text-sm">{product.name || 'منتج غير محدد'}</p>
                                                                {/* ✅ تفاصيل اللون/المقاس/العدد */}
                                                                {(product.chosenSize || product.chosenColor || product.chosenCount) && (
                                                                    <div className="mt-0.5 text-xs text-gray-600 flex flex-wrap gap-2">
                                                                        {product.chosenSize  && <span className="px-2 py-0.5 rounded-full border bg-gray-50">المقاس: {product.chosenSize}</span>}
                                                                        {product.chosenColor && <span className="px-2 py-0.5 rounded-full border bg-gray-50">اللون: {product.chosenColor}</span>}
                                                                        {product.chosenCount && <span className="px-2 py-0.5 rounded-full border bg-gray-50">العدد: {product.chosenCount}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-center">{product.quantity || 0}</td>
                                                        <td className="py-2 px-3 text-left">{formatPrice(product.price)} ر.ع</td>
                                                        <td className="py-2 px-3 text-left font-medium">
                                                            {formatPrice((product.price || 0) * (product.quantity || 0))} ر.ع
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Products View */}
                                    <div className="md:hidden">
                                        {viewOrder.products?.map((product, index) => (
                                            <div key={index} className="border-b p-3 last:border-b-0">
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0">
                                                        <img 
                                                            src={product.image || '/images/placeholder.jpg'} 
                                                            alt={product.name || 'منتج'} 
                                                            className="w-12 h-12 object-cover rounded"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder.jpg';
                                                                e.target.alt = 'صورة غير متوفرة';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-medium text-sm">{product.name || 'منتج غير محدد'}</p>
                                                        {/* ✅ تفاصيل اللون/المقاس/العدد للموبايل */}
                                                        {(product.chosenSize || product.chosenColor || product.chosenCount) && (
                                                            <div className="mt-0.5 text-xs text-gray-600 flex flex-wrap gap-2">
                                                                {product.chosenSize  && <span className="px-2 py-0.5 rounded-full border bg-gray-50">المقاس: {product.chosenSize}</span>}
                                                                {product.chosenColor && <span className="px-2 py-0.5 rounded-full border bg-gray-50">اللون: {product.chosenColor}</span>}
                                                                {product.chosenCount && <span className="px-2 py-0.5 rounded-full border bg-gray-50">العدد: {product.chosenCount}</span>}
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between mt-1">
                                                            <span className="text-xs">الكمية: {product.quantity || 0}</span>
                                                            <span className="text-xs font-medium">{formatPrice((product.price || 0) * (product.quantity || 0))} ر.ع</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 className="font-bold text-base md:text-lg mb-3 border-b pb-2">ملخص الفاتورة</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span>الإجمالي الجزئي:</span>
                                        <span>{formatPrice(viewOrder.amount - viewOrder.shippingFee)} ر.ع</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>رسوم الشحن:</span>
                                        <span>{viewOrder.shippingFee} ر.ع</span>
                                    </div>
                                    {viewOrder.discount > 0 && (
                                        <div className="flex justify-between items-center text-red-600">
                                            <span>خصم:</span>
                                            <span>-{formatPrice(viewOrder.discount)} ر.ع</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="font-bold">الإجمالي النهائي:</span>
                                        <span className="font-bold text-blue-600">{formatPrice(viewOrder.amount)} ر.ع</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end">
                                <button
                                    className="bg-gray-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-gray-600 text-xs md:text-sm flex items-center gap-1"
                                    onClick={handleCloseViewModal}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/>
                                    </svg>
                                    إغلاق
                                </button>
                                <button
                                    className="bg-blue-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-blue-600 text-xs md:text-sm flex items-center gap-1"
                                    onClick={handlePrintOrder}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 17v4h-12v-4h-4v-9c0-2.761 2.239-5 5-5h10c2.761 0 5 2.239 5 5v9h-4zm-10-1h8v1h-8v-1zm0-2h8v1h-8v-1zm-5-6v5h18v-5c0-1.656-1.344-3-3-3h-12c-1.656 0-3 1.344-3 3zm18 2h-2v-1h2v1z"/>
                                    </svg>
                                    طباعة
                                </button>
                                <button
                                    className="bg-green-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-green-600 text-xs md:text-sm flex items-center gap-1"
                                    onClick={handleDownloadPDF}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14 2v17h2v-7h3v7h2v-17h-7zm-9 0v17h2v-7h3v7h2v-17h-9z"/>
                                    </svg>
                                    تحميل PDF
                                </button>
                                {/* زر تواصل واتساب (اختياري) */}
                                {viewOrder?.customerPhone && (
                                  <button
                                    className="bg-emerald-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-emerald-700 text-xs md:text-sm flex items-center gap-1"
                                    onClick={() => handleContactWhatsApp(viewOrder.customerPhone)}
                                  >
                                    واتساب
                                  </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOrders;
