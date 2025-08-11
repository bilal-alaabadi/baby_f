import React from 'react'

const ShopFiltering = ({ categories, filtersState, setFiltersState, clearFilters }) => {
  return (
    <div className='space-y-5 flex-shrink-0 w-64'>

        {/* الفئات فقط */}
        <div className='flex flex-col space-y-2'>
            <h4 className='font-medium'>الفئة</h4>
            <hr />
            <div className='space-y-2'>
                {categories.map((cat) => (
                    <label key={cat.value} className='flex items-center cursor-pointer'>
                        <input 
                            type="radio" 
                            name="category" 
                            value={cat.value} 
                            checked={filtersState.category === cat.value}
                            onChange={(e) => setFiltersState({...filtersState, category: e.target.value})}
                            className='mr-2'
                        />
                        <span>{cat.label}</span>
                    </label>
                ))}
            </div>
        </div>
        <div className='mt-4'>
            <h3 className='font-medium text-lg'>الفلاتر</h3>
            <button 
                onClick={clearFilters}
                className='bg-[#3D4B2E]  py-2 px-4 text-white rounded hover:bg-[#c19e22] transition duration-300'
            >
                مسح الفلاتر
            </button>
        </div>
    </div>
  )
}

export default ShopFiltering