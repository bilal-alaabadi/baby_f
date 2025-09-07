import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* العنوان الرئيسي */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#3D4B2E] mb-8">
          سياسة الاسترجاع والاستبدال
        </h1>

        {/* المدة */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-[#3D4B2E] mb-3">المدة</h2>
          <p className="text-gray-700 leading-relaxed">
            يمكنك طلب استرجاع أو استبدال المنتج خلال <span className="font-semibold">5 أيام</span> من تاريخ الاستلام.
          </p>
        </section>

        {/* حالة المنتج */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-[#3D4B2E] mb-3">حالة المنتج</h2>
          <p className="text-gray-700 leading-relaxed">
            يُشترط أن يكون المنتج غير مستخدم، وبحالته الأصلية مع العلبة والتغليف.
          </p>
        </section>

        {/* متى يحق الاسترجاع أو الاستبدال؟ */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-[#3D4B2E] mb-3">
            متى يحق لك الاسترجاع أو الاستبدال؟
          </h2>
          <ul className="list-disc pr-6 space-y-2 text-gray-700">
            <li>إذا استلمت المنتج وكان فيه كسر، عيب، جزء ناقص، أو لا يعمل بشكل صحيح.</li>
            <li>إذا رغبت بالاسترجاع خلال 5 أيام وكان المنتج بحالته الأصلية دون استخدام.</li>
          </ul>
        </section>

        {/* متى لا يحق الاسترجاع؟ */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-[#3D4B2E] mb-3">
            متى لا يحق الاسترجاع؟
          </h2>
          <ul className="list-disc pr-6 space-y-2 text-gray-700">
            <li>إذا تم استخدام المنتج.</li>
            <li>إذا تم فتح المنتج وتجربته وكان سليمًا وخاليًا من العيوب.</li>
          </ul>
        </section>

        {/* تكاليف الشحن */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-[#3D4B2E] mb-3">تكاليف الشحن</h2>
          <ul className="list-disc pr-6 space-y-2 text-gray-700">
            <li>
              في حال كان سبب الاسترجاع عيب في المنتج أو خطأ من المتجر &rarr; نتحمل نحن تكاليف الشحن كاملة.
            </li>
            <li>
              في حال كان سبب الاسترجاع أو الاستبدال رغبة من العميل بدون خطأ من المتجر &rarr; يتحمل العميل تكاليف الشحن.
            </li>
          </ul>
        </section>

        {/* استرداد المبلغ */}
        <section className="mb-2">
          <h2 className="text-xl md:text-2xl font-semibold text-[#3D4B2E] mb-3">استرداد المبلغ</h2>
          <p className="text-gray-700 leading-relaxed">
            يتم إرجاع المبلغ للعميل خلال <span className="font-semibold">5 – 10 أيام عمل</span> بعد استلام المنتج وفحصه.
          </p>
        </section>

        {/* فاصل جمالي */}
        <div className="mt-10 text-center">
          <span className="inline-block h-1 w-24 rounded-full bg-[#d3ae27]" />
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
