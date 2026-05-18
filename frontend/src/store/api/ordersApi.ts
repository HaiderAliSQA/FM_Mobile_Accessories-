// frontend/src/store/api/ordersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Order, OrdersResponse, ApiResponse } from '../../types';
import { RootState } from '../store';

const API_URL = import.meta.env['VITE_API_URL'] as string ?? 'http://localhost:5002';

interface PlaceOrderPayload {
  shopName: string;
  ownerName: string;
  phone: string;
  city: string;
  items: Array<{
    productId: string;
    size?: number;
    color?: string;
    quantity: number;
  }>;
  paymentSchedule?: 'weekly' | 'monthly' | 'immediate';
  note?: string;
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
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
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    placeOrder: builder.mutation<ApiResponse<{ order: Order }>, PlaceOrderPayload>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    getOrders: builder.query<
      OrdersResponse,
      {
        page?: number;
        limit?: number;
        orderStatus?: string;
        paymentMethod?: string;
        search?: string;
        dateFrom?: string;
        dateTo?: string;
      }
    >({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['Order'],
    }),

    getOrderById: builder.query<ApiResponse<Order>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Order', id }],
    }),

    getOrderByNumber: builder.query<ApiResponse<Order>, string>({
      query: (orderNumber) => `/orders/by-number/${orderNumber}`,
      providesTags: (_result, _err, orderNumber) => [{ type: 'Order', id: orderNumber }],
    }),

    updateOrderStatus: builder.mutation<
      ApiResponse<Order>,
      { id: string; orderStatus?: string; transactionId?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderByNumberQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
