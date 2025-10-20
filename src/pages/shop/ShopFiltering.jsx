// ========================= src/pages/shop/ShopFiltering.jsx =========================
import React, { useMemo } from 'react';

const mainCategories = [
  { label: 'الكل', value: '' },
  { label: 'الألعاب', value: 'الألعاب' },
  { label: 'مستلزمات المواليد', value: 'مستلزمات المواليد' },
];

const subCategories = {
  '': [{ label: 'الكل', value: '' }],
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

const sortOptions = [
  { label: 'السعر: من الأعلى إلى الأدنى', value: 'price:desc' },
  { label: 'السعر: من الأدنى إلى الأعلى', value: 'price:asc' },
  { label: 'الأحدث ثم الأقدم', value: 'createdAt:desc' },
  { label: 'الأقدم ثم الأحدث', value: 'createdAt:asc' },
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
  const { mainCategory, category, availability, minPrice, maxPrice, sort } = filtersState;

  const currentSubs = useMemo(() => subCategories[mainCategory] || subCategories[''], [mainCategory]);

  const onChange = (name, value) =>
    setFiltersState(prev => ({ ...prev, [name]: value }));

  const handlePickMain = (val) => {
    setFiltersState(prev => ({ ...prev, mainCategory: val, category: '' }));
  };

  const handlePickSub = (val) => {
    setFiltersState(prev => ({ ...prev, category: val }));
  };

  return (
    <nav dir="rtl" aria-label="شريط فلاتر كامل"
      className="w-full rounded-2xl bg-white/70 backdrop-blur border border-gray-200 shadow-sm">
      {/* شريط علوي: عنوان + مسح */}


      {/* محتوى كامل بدون تمرير أفقي: التفاف لعدة أسطر */}
      <div className="flex flex-wrap items-start gap-5 px-4 pb-4">

        {/* التصنيفات الرئيسية */}
        <div className="flex flex-col gap-2 grow basis-[260px]">
          <span className="text-[11px] text-gray-600">التصنيف الرئيسي</span>
          <div className="flex flex-wrap items-center gap-2">
            {mainCategories.map((mc) => (
              <Chip
                key={mc.value || 'all-main'}
                active={mainCategory === mc.value}
                onClick={() => handlePickMain(mc.value)}
                ariaLabel={`main-${mc.label}`}
              >
                {mc.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* التصنيف الفرعي */}
        <div className="flex flex-col gap-2 grow basis-[320px]">
          <span className="text-[11px] text-gray-600">التصنيف الفرعي</span>
          <div className="flex flex-wrap items-center gap-2">
            {currentSubs.map((sc) => (
              <Chip
                key={(mainCategory || 'all') + '-' + (sc.value || 'all-sub')}
                active={category === sc.value}
                onClick={() => handlePickSub(sc.value)}
                ariaLabel={`sub-${sc.label}`}
              >
                {sc.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* التوفّر */}
        <div className="flex flex-col gap-2 grow basis-[260px]">
          <span className="text-[11px] text-[#92B0B0]">التوفّر</span>
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
        </div>

        {/* السعر */}
        <div className="flex flex-col gap-2 grow basis-[360px]">
          <span className="text-[11px] text-gray-600">السعر</span>
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

            {/* {Number.isFinite(Number(highestPrice)) && (
              <span className="text-[11px] text-gray-600">
                أعلى سعر: <span className="font-semibold">{Number(highestPrice).toFixed(3)} ر.ع</span>
              </span>
            )} */}
          </div>
        </div>

        {/* الترتيب */}
        <div className="flex flex-col gap-2 grow basis-[260px]">
          <span className="text-[11px] text-gray-600">الترتيب</span>
          <select
            value={sort}
            onChange={(e) => onChange('sort', e.target.value)}
            className="w-60 h-9 border rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#92B0B0]/40 border-[#92B0B0]/30 bg-white"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
                <button
          onClick={clearFilters}
          className="text-xs px-3 py-1.5 rounded-full bg-[#92B0B0] text-white hover:opacity-90 transition"
        >
          مسح الفلاتر
        </button>
      </div>
    </nav>
  );
};

export default ShopFiltering;
