// ========================= src/pages/shop/ShopPage.jsx =========================
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from './ProductCards';
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import timings from "../../assets/��بنر قسم الألعاب 3�.png";

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filtersState, setFiltersState] = useState({
    category: '',
    availability: '',  // '', 'in', 'out'
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt:desc',
  });

  // قراءة الفلاتر من URL أول مرة
  useEffect(() => {
    const category     = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const minPrice     = searchParams.get('minPrice') || '';
    const maxPrice     = searchParams.get('maxPrice') || '';
    const sort         = searchParams.get('sort') || 'createdAt:desc';
    setFiltersState({ category, availability, minPrice, maxPrice, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // مزامنة الفلاتر مع URL
  useEffect(() => {
    const params = {};
    if (filtersState.category)     params.category     = filtersState.category;
    if (filtersState.availability) params.availability = filtersState.availability;
    if (filtersState.minPrice)     params.minPrice     = filtersState.minPrice;
    if (filtersState.maxPrice)     params.maxPrice     = filtersState.maxPrice;
    if (filtersState.sort && filtersState.sort !== 'createdAt:desc') params.sort = filtersState.sort;
    setSearchParams(params, { replace: true });
  }, [filtersState, setSearchParams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [ProductsPerPage] = useState(8);

  const {
    data: { products = [], totalPages = 1, totalProducts = 0, highestPrice = null } = {},
    error,
    isLoading
  } = useFetchAllProductsQuery({
    category: filtersState.category,
    availability: filtersState.availability,
    minPrice: filtersState.minPrice,
    maxPrice: filtersState.maxPrice,
    sort: filtersState.sort,
    page: currentPage,
    limit: ProductsPerPage,
  });

  // ارجاع للصفحة الأولى عند تغيّر أي فلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filtersState.category,
    filtersState.availability,
    filtersState.minPrice,
    filtersState.maxPrice,
    filtersState.sort,
  ]);

  const clearFilters = () => {
    setFiltersState({
      category: '',
      availability: '',
      minPrice: '',
      maxPrice: '',
      sort: 'createdAt:desc',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  if (isLoading) return <div className="text-center py-8">جاري التحميل...</div>;
  if (error) return <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المنتجات</div>;

  return (
    <>
      {/* بنر */}
      <section className='relative w-100 overflow-hidden bg-[#e2e5e5]'>
        <img src={timings} alt="متجر" className="w-100 h-100 object-cover object-center" />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center" />
      </section>

      {/* شريط فلاتر */}
      <div className=" pt-6">
        <ShopFiltering
          filtersState={filtersState}
          setFiltersState={setFiltersState}
          clearFilters={clearFilters}
          highestPrice={highestPrice}
        />
      </div>

      {/* عدد النتائج */}
      {/* <div className="section__container py-3">
        <p className="text-xs text-gray-600" dir="rtl">
          النتائج: <span className="font-semibold">{totalProducts}</span>
        </p>
      </div> */}

      {/* قائمة المنتجات + صفحات */}
      <section className='section__container'>
        {products.length > 0 ? (
          <>
            <ProductCards products={products} />

            <div className='mt-6 flex justify-center flex-wrap gap-2'>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50'
              >
                السابق
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-[#92B0B0] text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50'
              >
                التالي
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">لا توجد منتجات متاحة حسب الفلتر المحدد</p>
          </div>
        )}
      </section>
    </>
  );
};

export default ShopPage;
