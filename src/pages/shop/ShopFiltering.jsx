// ========================= src/pages/shop/ShopFiltering.jsx =========================
import React, { useMemo, useState } from 'react';

const sortOptions = [
  { label: 'السعر: من الأعلى إلى الأدنى', value: 'price:desc' },
  { label: 'السعر: من الأدنى إلى الأعلى', value: 'price:asc' },
  { label: 'الأحدث ثم الأقدم', value: 'createdAt:desc' },
  { label: 'الأقدم ثم الأحدث', value: 'createdAt:asc' },
];

// جميع التصنيفات الفرعية (بدون تصنيف رئيسي)
const ALL_SUB_CATEGORIES = [
  { label: 'الكل', value: '' },
  // الألعاب
  { label: 'ألعاب تعليمية', value: 'ألعاب تعليمية' },
  { label: 'ألعاب تنمية المهارات', value: 'ألعاب تنمية المهارات' },
  { label: 'ألعاب ترفيهية', value: 'ألعاب ترفيهية' },
  { label: 'ألعاب رضع', value: 'ألعاب رضع' },
  // مستلزمات المواليد
  { label: 'سرير وأثاث الطفل', value: 'سرير وأثاث الطفل' },
  { label: 'مستلزمات استحمام', value: 'مستلزمات استحمام' },
  { label: 'مستلزمات أخرى', value: 'مستلزمات أخرى' },
];

const Chip = ({ active, children, onClick, ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs border transition
      ${active ? 'bg-[#92B0B0] text-white border-[#92B0B0]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
  >
    {children}
  </button>
);

// قسم قابل للطي على الجوال، ومفتوح دائمًا على md+
const Collapsible = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between md:cursor-default md:pointer-events-none
                   md:bg-transparent md:border-0
                   bg-white/80 border border-gray-200 px-3 py-2 rounded-xl md:rounded-none md:p-0"
      >
        <span className="text-[11px] text-gray-600">{title}</span>
        <span className="md:hidden text-xs text-gray-500">{open ? 'إخفاء' : 'إظهار'}</span>
      </button>
      <div className={`${open ? 'block' : 'hidden'} md:block mt-2`}>
        {children}
      </div>
    </section>
  );
};

const Segmented = ({ value, onChange, options, name }) => (
  <div className="inline-flex rounded-xl border border-gray-300 bg-white overflow-hidden">
    {options.map((opt, idx) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value + idx}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 text-xs transition
            ${active ? 'bg-[#92B0B0] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
            ${idx !== options.length - 1 ? 'border-l border-gray-200' : ''}`}
          aria-pressed={active}
          aria-label={`${name}-${opt.label}`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const ShopFiltering = ({ filtersState, setFiltersState, clearFilters, highestPrice }) => {
  const { category, availability, minPrice, maxPrice, sort } = filtersState;
  const currentSubs = useMemo(() => ALL_SUB_CATEGORIES, []);

  const onChange = (name, value) =>
    setFiltersState(prev => ({ ...prev, [name]: value }));

  const handlePickSub = (val) => {
    setFiltersState(prev => ({ ...prev, category: val }));
  };

  // تحكم إظهار كامل لوحة الفلاتر على الجوال
  const [mobileOpen, setMobileOpen] = useState(false);
  const contentId = 'filters-content';

  return (
    <>
      {/* شريط علوي أفقي (يظهر على الجوال فقط) */}
      <div className="w-full bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-30 md:hidden flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">الفلاتر</h3>
        <button
          type="button"
          onClick={() => setMobileOpen(o => !o)}
          className="text-xs px-3 py-1.5 rounded-full bg-[#92B0B0] text-white hover:opacity-90 transition"
          aria-expanded={mobileOpen}
          aria-controls={contentId}
        >
          {mobileOpen ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
        </button>
      </div>

      {/* صندوق الفلاتر */}
      <nav
        id={contentId}
        dir="rtl"
        aria-label="شريط فلاتر كامل"
        className={`w-full rounded-2xl bg-white/70 backdrop-blur border border-gray-200 shadow-sm ${mobileOpen ? 'block' : 'hidden'} md:block`}
      >
        <div className="flex flex-wrap items-start gap-5 px-4 pb-4">
          {/* التصنيف */}
          <div className="flex flex-col gap-2 grow basis-[420px]">
            <Collapsible title="التصنيف" defaultOpen={false}>
              <div className="flex flex-wrap items-center gap-2">
                {currentSubs.map((sc) => (
                  <Chip
                    key={sc.value || 'all-sub'}
                    active={category === sc.value}
                    onClick={() => handlePickSub(sc.value)}
                    ariaLabel={`sub-${sc.label}`}
                  >
                    {sc.label}
                  </Chip>
                ))}
              </div>
            </Collapsible>
          </div>

          {/* التوفّر */}
          <div className="flex flex-col gap-2 grow basis-[260px]">
            <Collapsible title="التوفّر" defaultOpen={false}>
              <Segmented
                name="availability"
                value={availability}
                onChange={(val) => onChange('availability', val)}
                options={[
                  { label: 'الكل', value: '' },
                  { label: 'متوفر', value: 'in' },
                  { label: 'غير متوفر', value: 'out' },
                ]}
              />
            </Collapsible>
          </div>

          {/* السعر */}
          <div className="flex flex-col gap-2 grow basis-[360px]">
            <Collapsible title="السعر" defaultOpen={false}>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 bg-white border border-[#92B0B0]/30 rounded-xl px-3 py-1.5">
                  <span className="text-[11px] text-gray-600">من</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={minPrice}
                    onChange={(e) => onChange('minPrice', e.target.value)}
                    className="h-8 w-28 border rounded-md px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#92B0B0]/40 border-[#92B0B0]/30"
                    placeholder="0"
                  />
                </label>
                <label className="flex items-center gap-2 bg-white border border-[#92B0B0]/30 rounded-xl px-3 py-1.5">
                  <span className="text-[11px] text-gray-600">إلى</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={maxPrice}
                    onChange={(e) => onChange('maxPrice', e.target.value)}
                    className="h-8 w-28 border rounded-md px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#92B0B0]/40 border-[#92B0B0]/30"
                    placeholder="مثال: 50"
                  />
                </label>

                {/* مؤشر أعلى سعر (اختياري) */}
                {/* {Number.isFinite(Number(highestPrice)) && (
                  <span className="text-[11px] text-gray-600">
                    أعلى سعر: <span className="font-semibold">{Number(highestPrice).toFixed(3)} ر.ع</span>
                  </span>
                )} */}
              </div>
            </Collapsible>
          </div>

          {/* الترتيب */}
          <div className="flex flex-col gap-2 grow basis-[260px]">
            <Collapsible title="الترتيب" defaultOpen={false}>
              <select
                value={sort}
                onChange={(e) => onChange('sort', e.target.value)}
                className="w-60 h-9 border rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#92B0B0]/40 border-[#92B0B0]/30 bg-white"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Collapsible>
          </div>

          {/* زر مسح الفلاتر */}
          <button
            onClick={clearFilters}
            className="text-xs px-3 py-1.5 rounded-full bg-[#92B0B0] text-white hover:opacity-90 transition"
          >
            مسح الفلاتر
          </button>
        </div>
      </nav>
    </>
  );
};

export default ShopFiltering;
