// frontend/src/store/api/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product, ProductsResponse, ApiResponse } from '../../types';
import { RootState } from '../store';

const API_URL = import.meta.env['VITE_API_URL'] as string ?? 'http://localhost:5002';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<
      ProductsResponse,
      {
        category?: string;
        size?: string;
        color?: string;
        minPrice?: string;
        maxPrice?: string;
        search?: string;
        featured?: string;
        newArrival?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
      }
    >({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),

    getFeaturedProducts: builder.query<ApiResponse<Product[]>, void>({
      query: () => '/products/featured',
      providesTags: ['Product'],
    }),

    getNewArrivals: builder.query<ApiResponse<Product[]>, void>({
      query: () => '/products/new-arrivals',
      providesTags: ['Product'],
    }),

    getProductBySlug: builder.query<ApiResponse<Product>, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_result, _err, slug) => [{ type: 'Product', id: slug }],
    }),

    getAdminProducts: builder.query<
      ProductsResponse,
      { page?: number; limit?: number; search?: string; category?: string }
    >({
      query: (params) => ({
        url: '/products/admin/all',
        params,
      }),
      providesTags: ['Product'],
    }),

    createProduct: builder.mutation<ApiResponse<Product>, Partial<Product>>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; data: Partial<Product> }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    toggleVisibility: builder.mutation<
      ApiResponse<{ id: string; isVisible: boolean }>,
      string
    >({
      query: (id) => ({
        url: `/products/${id}/visibility`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Product'],
    }),

    toggleDiscontinued: builder.mutation<
      ApiResponse<{ id: string; isDiscontinued: boolean }>,
      string
    >({
      query: (id) => ({
        url: `/products/${id}/discontinue`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Product'],
    }),

    toggleFeatured: builder.mutation<
      ApiResponse<{ id: string; isFeatured: boolean }>,
      string
    >({
      query: (id) => ({
        url: `/products/${id}/featured`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Product'],
    }),

    toggleSizeBlock: builder.mutation<
      ApiResponse<{ id: string; sizes: Product['sizes'] }>,
      { id: string; sizeValue: number }
    >({
      query: ({ id, sizeValue }) => ({
        url: `/products/${id}/sizes/${sizeValue}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Product'],
    }),

    updateStock: builder.mutation<
      ApiResponse<{ id: string; stock: number }>,
      { id: string; stock: number }
    >({
      query: ({ id, stock }) => ({
        url: `/products/${id}/stock`,
        method: 'PATCH',
        body: { stock },
      }),
      invalidatesTags: ['Product'],
    }),

    getLowStockProducts: builder.query<ApiResponse<Product[]>, void>({
      query: () => '/products/admin/low-stock',
      providesTags: ['Product'],
    }),

    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetProductBySlugQuery,
  useGetAdminProductsQuery,
  useGetLowStockProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useToggleVisibilityMutation,
  useToggleDiscontinuedMutation,
  useToggleFeaturedMutation,
  useToggleSizeBlockMutation,
  useUpdateStockMutation,
  useDeleteProductMutation,
} = productsApi;
