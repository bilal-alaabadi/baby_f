// ========================= redux/features/products/productsApi.js =========================
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

    // جلب المنتجات مع دعم الفلاتر
    fetchAllProducts: builder.query({
      query: ({
        mainCategory,
        category,
        availability,        // '', 'in', 'out'
        minPrice,
        maxPrice,
        search,
        sort = "createdAt:desc",
        page = 1,
        limit = 10,
      }) => {
        const params = {
          page: String(page),
          limit: String(limit),
          sort,
        };

        if (mainCategory && mainCategory !== "الكل") params.mainCategory = mainCategory;
        if (category && category !== "الكل") params.category = category;
        if (availability) params.availability = availability;

        if (minPrice != null && minPrice !== "") params.minPrice = String(minPrice);
        if (maxPrice != null && maxPrice !== "") params.maxPrice = String(maxPrice);
        if (search) params.search = search;

        const queryParams = new URLSearchParams(params).toString();
        return `/?${queryParams}`;
      },
      // نعيد highestPrice للفلاتر
      transformResponse: (response) => ({
        products: response.products,
        totalPages: response.totalPages,
        totalProducts: response.totalProducts,
        highestPrice: response.highestPrice ?? null,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    // تفاصيل منتج (تُطبع countPrices وتحوَّل الألوان إلى أسماء فقط)
    fetchProductById: builder.query({
      query: (id) => `/product/${id}`,
      transformResponse: (response) => {
        // ندعم شكلين:
        // 1) { product: {...}, reviews? }
        // 2) {...} مباشرة كمنتج
        const product = response?.product ?? response;
        if (!product || typeof product !== "object") {
          throw new Error("المنتج غير موجود");
        }

        // صور
        const images = Array.isArray(product.image)
          ? product.image
          : product.image
          ? [product.image]
          : [];

        // countPrices: [{count, price, stock?}]
        const normalizedCountPrices = Array.isArray(product.countPrices)
          ? product.countPrices
              .map((cp) => ({
                count: String(cp?.count ?? "").trim(),
                price: Number(cp?.price ?? NaN),
                stock:
                  cp?.stock === undefined || cp?.stock === null || cp?.stock === ""
                    ? undefined
                    : Number(cp.stock),
              }))
              .filter((x) => x.count && !Number.isNaN(x.price) && x.price >= 0)
          : [];

        // الألوان: نقبل ["أحمر", "أزرق"] أو [{name:"أحمر", image:"..."}, ...]
        const rawColors = Array.isArray(product.colors) ? product.colors : [];
        const colorNames = rawColors
          .map((c) => (typeof c === "string" ? c : String(c?.name || "")))
          .map((s) => s.trim())
          .filter(Boolean);

        // التقييمات
        const reviews =
          Array.isArray(response?.reviews) ? response.reviews :
          Array.isArray(product?.reviews) ? product.reviews : [];

        return {
          _id: product._id,
          name: product.name,
          mainCategory: product.mainCategory,
          category: product.category,
          size: product.size || "",
          count: product.count || "",
          price: product.price, // السعر الأساسي (أقل سعر إن وُجدت خيارات يعالجه الباك/عند العرض)
          oldPrice: product.oldPrice ?? "",
          description: product.description,
          image: images,
          author: product.author,
          stock:
            typeof product.stock === "string"
              ? Number(product.stock)
              : product.stock ?? 0,
          rating: product.rating ?? 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          colors: colorNames,                 // أسماء فقط لتوافق الواجهة
          reviews,
          countPrices: normalizedCountPrices, // [{count, price, stock?}]
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
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      transformResponse: (response) =>
        response.map((product) => ({
          ...product,
          images: Array.isArray(product.image) ? product.image : [product.image],
          stock:
            typeof product.stock === "string"
              ? Number(product.stock)
              : product.stock ?? 0,
        })),
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
