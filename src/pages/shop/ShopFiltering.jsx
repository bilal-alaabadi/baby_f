import React, { useState, useMemo } from 'react';

const mainCategories = [
  { label: 'الألعاب', value: 'الألعاب' },
  { label: 'مستلزمات المواليد', value: 'مستلزمات المواليد' },
];

const subCategories = {
  'الألعاب': [
    { label: 'الكل', value: '' },
    { label: 'ألعاب تعليمية', value: 'ألعاب تعليمية' },
    { label: 'ألعاب تنمية المهارات', value: 'ألعاب تنمية المهارات' },
    { label: 'ألعاب ترفيهية', value: 'ألعاب ترفيهية' },
    { label: 'ألعاب رضع', value: 'ألعاب رضع' },
  ],
  'مستلزمات المواليد': [
    { label: 'الكل', value: '' },
    { label: 'سرير وأثاث الطفل', value: 'سرير وأثاث الطفل' },
    { label: 'مستلزمات استحمام', value: 'مستلزمات استحمام' },
    { label: 'مستلزمات أخرى', value: 'مستلزمات أخرى' },
  ],
};

const ShopFiltering = ({ filtersState, setFiltersState, clearFilters }) => {
  // فتح/إغلاق مجموعات الأكورديون على الهاتف
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(mainCategories.map(c => [c.value, true]))
  );

  const toggleSection = (val) => {
    setOpenSections(prev => ({ ...prev, [val]: !prev[val] }));
  };

  const sectionIsActive = useMemo(() => {
    // يحدد القسم المفعّل لتلوين البطاقة
    const active = {};
    mainCategories.forEach(({ value }) => {
      active[value] =
        filtersState.mainCategory === value; // مفعّل إذا الفئة الرئيسية من هذا القسم
    });
    return active;
  }, [filtersState]);

  const handlePick = (mainValue, subValue) => {
    setFiltersState({ mainCategory: mainValue, category: subValue });
  };

  return (
    <aside className="w-full md:w-72 md:max-w-72 flex-shrink-0" dir="rtl" aria-label="فلاتر المتجر">
      {/* حاوية عامة جميلة */}
      <div className="space-y-4 md:space-y-5">
        {/* بطاقة عنوان الفلاتر */}
        <div className="rounded-2xl bg-white/70 backdrop-blur shadow-sm border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">الفلاتر</h3>
            <button
              onClick={clearFilters}
              className="text-sm md:text-[13px] px-3 py-1.5 rounded-full bg-[#92B0B0] text-white hover:opacity-90 transition"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        {/* بطاقات المجموعات */}
        <div className="space-y-3">
          {mainCategories.map((main) => {
            const isOpen = openSections[main.value];
            const isActive = sectionIsActive[main.value];

            return (
              <section
                key={main.value}
                className={`rounded-2xl border transition shadow-sm ${
                  isActive ? 'border-[#3D4B2E] bg-[#f6f8f4]' : 'border-gray-200 bg-white'
                }`}
              >
                {/* رأس المجموعة (أكورديون في الهاتف / ثابت في الكمبيوتر) */}
                <button
                  type="button"
                  onClick={() => toggleSection(main.value)}
                  className="w-full flex items-center justify-between p-4 md:p-5 md:cursor-default"
                  aria-expanded={isOpen}
                  aria-controls={`panel-${main.value}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block size-2 rounded-full ${
                        isActive ? 'bg-[#3D4B2E]' : 'bg-gray-300'
                      }`}
                    />
                    <h4 className="text-[15px] md:text-base font-semibold text-gray-800">{main.label}</h4>
                  </div>

                  {/* سهم موبايل فقط */}
                  <svg
                    className={`md:hidden h-5 w-5 text-gray-500 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4A1 1 0 0 1 6.707 6.293L10 9.586l3.293-3.293A1 1 0 1 1 14.707 7.707l-4 4A1 1 0 0 1 10 12z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* لوحة الخيارات */}
                <div
                  id={`panel-${main.value}`}
                  className={`px-4 pb-4 md:px-5 md:pb-5 ${isOpen ? 'block' : 'hidden md:block'}`}
                >
                  {/* شبكة أنيقة للخيارات */}
                  <div className="grid grid-cols-1 gap-2">
                    {subCategories[main.value]?.map((sub) => {
                      const checked =
                        filtersState.mainCategory === main.value &&
                        filtersState.category === sub.value;

                      return (
                        <label
                          key={`${main.value}-${sub.value || 'all'}`}
                          className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 cursor-pointer transition ${
                            checked
                              ? 'border-[#3D4B2E] bg-[#eef2ec]'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`radio-${main.value}`}
                              value={sub.value}
                              checked={checked}
                              onChange={() => handlePick(main.value, sub.value)}
                              className="accent-[#3D4B2E] ml-1"
                              aria-label={`${main.label} - ${sub.label}`}
                            />
                            <span className="text-sm text-gray-800">{sub.label}</span>
                          </div>

                          {/* شارة اختيار */}
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              checked ? 'bg-[#3D4B2E] text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {checked ? 'محدد' : 'اختر'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ShopFiltering;
