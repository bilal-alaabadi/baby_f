import React, { useState } from 'react';
import ProductCards from './ProductCards';
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';

const categories = [
    { label: 'أختر منتج', value: '' },
    { label: 'عطور', value: 'عطور' },
    { label: 'معطرات الجسم', value: 'معطرات الجسم' },
    { label: 'معطر الجو', value: 'معطر الجو' },
    { label: 'عصي العتم', value: 'عصي العتم' }
];
 
const ShopPage = () => {
    const [filtersState, setFiltersState] = useState({
        category: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [ProductsPerPage] = useState(8);
    const [showFilters, setShowFilters] = useState(false);

    const { data: { products = [], totalPages, totalProducts } = {}, error, isLoading } = useFetchAllProductsQuery({
        category: filtersState.category,
        page: currentPage,
        limit: ProductsPerPage,
    });

    const clearFilters = () => {
        setFiltersState({ category: '' });
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
            <section className='section__container bg-[#e2e5e5]'>
                <h2 className='section__header capitalize'>صفحة المتجر</h2>
            </section>

            <section className='section__container'>
                <div className='flex flex-col md:flex-row md:gap-12 gap-8'>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className='md:hidden bg-[#3D4B2E] py-2 px-4 text-white rounded mb-4 w-fit'
                    >
                        {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                    </button>

                    <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                        <ShopFiltering
                            categories={categories}
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
                                            className={`px-4 py-2 mx-1 rounded-md ${currentPage === index + 1 ? 'bg-[#3D4B2E] text-white' : 'bg-gray-200 text-gray-700'}`}
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