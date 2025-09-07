import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../../utils/baseURL";

const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/products`,
    credentials: "include",
  }),
  tagTypes: ["Product", "ProductList"],
  endpoints: (builder) => ({

    fetchAllProducts: builder.query({
      query: ({
        category,
        gender,
        minPrice,
        maxPrice,
        search,
        sort = "createdAt:desc",
        page = 1,
        limit = 10,
      }) => {
        const params = {
          page: page.toString(),
          limit: limit.toString(),
          sort,
        };
        if (category && category !== "الكل") params.category = category;
        if (gender) params.gender = gender;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (search) params.search = search;

        const queryParams = new URLSearchParams(params).toString();
        return `/?${queryParams}`;
      },
      transformResponse: (response) => ({
        products: response.products,
        totalPages: response.totalPages,
        totalProducts: response.totalProducts,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    // ✅ إصلاح: إرجاع stock + reviews + باقي الحقول
    fetchProductById: builder.query({
      query: (id) => `/product/${id}`,
      transformResponse: (response) => {
        const product = response?.product;
        if (!product) {
          throw new Error("المنتج غير موجود");
        }
        return {
          _id: product._id,
          name: product.name,
          mainCategory: product.mainCategory,
          category: product.category,
          size: product.size || "",
          price: product.price,
          oldPrice: product.oldPrice ?? "",
          description: product.description,
          image: Array.isArray(product.image) ? product.image : [product.image],
          author: product.author,
          // 👇 مهم:
          stock: typeof product.stock === "string" ? Number(product.stock) : (product.stock ?? 0),
          rating: product.rating ?? 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          // المراجعات كما أرسلها السيرفر
          reviews: Array.isArray(response.reviews) ? response.reviews : [],
        };
      },
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    fetchRelatedProducts: builder.query({
      query: (id) => `/related/${id}`,
      providesTags: (result, error, id) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/create-product",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["ProductList"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-product/${id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    searchProducts: builder.query({
      query: (searchTerm) => `/search?q=${searchTerm}`,
      transformResponse: (response) => {
        return response.map((product) => ({
          ...product,
          price:
            product.category === "حناء بودر"
              ? product.price
              : product.regularPrice,
          images: Array.isArray(product.image) ? product.image : [product.image],
          // اختياري: تمرير المخزون لو محتاجه في نتائج البحث
          stock:
            typeof product.stock === "string"
              ? Number(product.stock)
              : (product.stock ?? 0),
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    fetchBestSellingProducts: builder.query({
      query: (limit = 4) => `/best-selling?limit=${limit}`,
      providesTags: ["ProductList"],
    }),
  }),
});

export const {
  useFetchAllProductsQuery,
  useLazyFetchAllProductsQuery,
  useFetchProductByIdQuery,
  useLazyFetchProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useFetchRelatedProductsQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useFetchBestSellingProductsQuery,
} = productsApi;

export default productsApi;
