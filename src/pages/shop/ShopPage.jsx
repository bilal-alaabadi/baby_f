import React, { useState, useEffect } from 'react';
import ProductCards from './ProductCards';
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import timings from "../../assets/��بنر قسم الألعاب 3�.png";
const ShopPage = () => {
  const [filtersState, setFiltersState] = useState({
    mainCategory: '',
    category: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [ProductsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  const { data: { products = [], totalPages = 1, totalProducts } = {}, error, isLoading } =
    useFetchAllProductsQuery({
      mainCategory: filtersState.mainCategory,
      category: filtersState.category,
      page: currentPage,
      limit: ProductsPerPage,
    });

  // إعادة الصفحة للأولى عند تغيير الفلاتر
  useEffect(() => {
    setCurrentPage(1);
  }, [filtersState.mainCategory, filtersState.category]);

  const clearFilters = () => {
    setFiltersState({ mainCategory: '', category: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading) return <div className="text-center py-8">جاري التحميل...</div>;
  if (error) return <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المنتجات</div>;

  const startProduct = (currentPage - 1) * ProductsPerPage + 1;
  const endProduct = startProduct + products.length - 1;

  return (
    <>
      <section className='relative w-100 overflow-hidden bg-[#e2e5e5]' >
        <img
          src={timings}
          alt="متجر حناء برغند"
          className="w-100 h-100 object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4"></h1>
        </div>
      </section>

      <section className='section__container'>
        <div className='flex flex-col md:flex-row md:gap-12 gap-8'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='md:hidden bg-[#92B0B0] py-2 px-4 text-white rounded mb-4 w-fit'
          >
            {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <ShopFiltering
              filtersState={filtersState}
              setFiltersState={setFiltersState}
              clearFilters={clearFilters}
            />
          </div>

          <div className='flex-1'>
            {products.length > 0 ? (
              <>
                <ProductCards products={products} />

                <div className='mt-6 flex justify-center'>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 disabled:opacity-50'
                  >
                    السابق
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 mx-1 rounded-md ${currentPage === index + 1 ? 'bg-[#92B0B0] text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md ml-2 disabled:opacity-50'
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
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopPage;
