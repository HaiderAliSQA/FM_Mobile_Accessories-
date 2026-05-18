// frontend/src/store/api/wholesaleApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  ShopKeeper,
  ShopKeepersResponse,
  WholesaleOrder,
  WholesaleOrdersResponse,
  WholesalePayment,
  WholesalePaymentsResponse,
  WholesaleStatsResponse,
  RecordPaymentPayload,
  ApiResponse,
} from '../../types';
import { RootState } from '../store';

const API_URL = (import.meta.env['VITE_API_URL'] as string) ?? 'http://localhost:5002';

export const wholesaleApi = createApi({
  reducerPath: 'wholesaleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/admin`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['ShopKeeper', 'WholesaleOrder', 'WholesalePayment'],
  endpoints: (builder) => ({

    // ── ShopKeepers ──────────────────────────────────────────────────────────
    getShopKeepers: builder.query<ShopKeepersResponse, { page?: number; limit?: number; search?: string; city?: string; isActive?: boolean }>({
      query: (params) => ({ url: '/shopkeepers', params }),
      providesTags: ['ShopKeeper'],
    }),

    getShopKeeperById: builder.query<ApiResponse<{ shopKeeper: ShopKeeper; orderCount: number }>, string>({
      query: (id) => `/shopkeepers/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'ShopKeeper', id }],
    }),

    getShopKeeperLedger: builder.query<ApiResponse<{ shopKeeper: ShopKeeper; ledger: unknown[]; summary: { totalOrdered: number; totalPaid: number; totalDue: number; orderCount: number } }>, string>({
      query: (id) => `/shopkeepers/${id}/ledger`,
      providesTags: (_r, _e, id) => [{ type: 'ShopKeeper', id }],
    }),

    getShopKeeperOrders: builder.query<WholesaleOrdersResponse, { id: string; page?: number; paymentStatus?: string }>({
      query: ({ id, ...params }) => ({ url: `/shopkeepers/${id}/orders`, params }),
      providesTags: ['WholesaleOrder'],
    }),

    getShopKeeperPayments: builder.query<WholesalePaymentsResponse, { id: string; page?: number }>({
      query: ({ id, ...params }) => ({ url: `/shopkeepers/${id}/payments`, params }),
      providesTags: ['WholesalePayment'],
    }),

    createShopKeeper: builder.mutation<ApiResponse<ShopKeeper>, Partial<ShopKeeper>>({
      query: (body) => ({ url: '/shopkeepers', method: 'POST', body }),
      invalidatesTags: ['ShopKeeper'],
    }),

    updateShopKeeper: builder.mutation<ApiResponse<ShopKeeper>, { id: string } & Partial<ShopKeeper>>({
      query: ({ id, ...body }) => ({ url: `/shopkeepers/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ShopKeeper', id }, 'ShopKeeper'],
    }),

    deleteShopKeeper: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/shopkeepers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ShopKeeper'],
    }),

    // ── WholesaleOrders ──────────────────────────────────────────────────────
    getWholesaleOrders: builder.query<WholesaleOrdersResponse, {
      page?: number; limit?: number; paymentStatus?: string;
      orderStatus?: string; shopKeeper?: string; search?: string;
      dateFrom?: string; dateTo?: string;
    }>({
      query: (params) => ({ url: '/wholesale-orders', params }),
      providesTags: ['WholesaleOrder'],
    }),

    getWholesaleOrderById: builder.query<ApiResponse<{ order: WholesaleOrder; payments: WholesalePayment[] }>, string>({
      query: (id) => `/wholesale-orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'WholesaleOrder', id }],
    }),

    getWholesaleStats: builder.query<WholesaleStatsResponse, void>({
      query: () => '/wholesale-orders/stats',
      providesTags: ['WholesaleOrder', 'WholesalePayment'],
    }),

    createWholesaleOrder: builder.mutation<ApiResponse<WholesaleOrder> & { creditLimitWarning?: string }, {
      shopKeeperId: string;
      items: { name: string; brand?: string; price: number; quantity: number; productId?: string }[];
      deliveryFee?: number;
      discount?: number;
      paymentSchedule?: string;
      expectedPaymentDate?: string;
      adminNotes?: string;
    }>({
      query: (body) => ({ url: '/wholesale-orders', method: 'POST', body }),
      invalidatesTags: ['WholesaleOrder', 'ShopKeeper'],
    }),

    updateWholesaleOrderStatus: builder.mutation<ApiResponse<WholesaleOrder>, {
      id: string; orderStatus?: string; adminNotes?: string;
      expectedPaymentDate?: string; paymentSchedule?: string; forceCancel?: boolean;
    }>({
      query: ({ id, ...body }) => ({ url: `/wholesale-orders/${id}/status`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'WholesaleOrder', id }, 'WholesaleOrder', 'ShopKeeper'],
    }),

    // ── WholesalePayments ────────────────────────────────────────────────────
    getWholesalePayments: builder.query<WholesalePaymentsResponse, {
      page?: number; limit?: number; orderId?: string;
      shopKeeperId?: string; from?: string; to?: string; method?: string;
    }>({
      query: (params) => ({ url: '/wholesale-payments', params }),
      providesTags: ['WholesalePayment'],
    }),

    getWholesalePaymentById: builder.query<ApiResponse<WholesalePayment>, string>({
      query: (id) => `/wholesale-payments/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'WholesalePayment', id }],
    }),

    recordPayment: builder.mutation<ApiResponse<{ payment: WholesalePayment; order: WholesaleOrder }>, RecordPaymentPayload>({
      query: (body) => ({ url: '/wholesale-payments', method: 'POST', body }),
      invalidatesTags: ['WholesalePayment', 'WholesaleOrder', 'ShopKeeper'],
    }),

    deleteWholesalePayment: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/wholesale-payments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['WholesalePayment', 'WholesaleOrder', 'ShopKeeper'],
    }),
  }),
});

export const {
  useGetShopKeepersQuery,
  useGetShopKeeperByIdQuery,
  useGetShopKeeperLedgerQuery,
  useGetShopKeeperOrdersQuery,
  useGetShopKeeperPaymentsQuery,
  useCreateShopKeeperMutation,
  useUpdateShopKeeperMutation,
  useDeleteShopKeeperMutation,
  useGetWholesaleOrdersQuery,
  useGetWholesaleOrderByIdQuery,
  useGetWholesaleStatsQuery,
  useCreateWholesaleOrderMutation,
  useUpdateWholesaleOrderStatusMutation,
  useGetWholesalePaymentsQuery,
  useGetWholesalePaymentByIdQuery,
  useRecordPaymentMutation,
  useDeleteWholesalePaymentMutation,
} = wholesaleApi;
