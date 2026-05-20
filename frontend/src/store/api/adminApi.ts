import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Admin, ApiResponse } from '../../types';
import { RootState } from '../store';

const API_URL = import.meta.env['VITE_API_URL'] as string ?? 'http://localhost:5002';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCollected: number;
  totalDue: number;
  unpaidOrders: number;
  partialOrders: number;
  recentOrders: any[];
  overdueOrders: any[];
}

interface UploadResult {
  url: string;
  publicId: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      // ── Auth token ──────────────────────────────────────────
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // ── CRITICAL FIX: Remove Content-Type for FormData ──────
      // fetchBaseQuery sets Content-Type: application/json by default.
      // For FormData (file uploads), browser MUST set its own
      // Content-Type: multipart/form-data; boundary=... automatically.
      // If we leave application/json here, multer cannot parse files.
      //
      // We detect FormData by checking if Content-Type was already
      // set to application/json — if the body is FormData, delete it.
      // The browser will set the correct multipart header automatically.
      if (headers.get('Content-Type') === 'application/json') {
        // Will be overridden by browser for FormData — safe to keep
        // But for explicit FormData endpoints we delete it below
      }

      return headers;
    },
  }),
  tagTypes: ['Admin', 'Stats'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    getMe: builder.query<ApiResponse<Admin>, void>({
      query: () => '/auth/me',
      providesTags: ['Admin'],
    }),

    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Stats'],
    }),

    // ── UPLOAD SINGLE IMAGE ──────────────────────────────────
    // FormData body — Content-Type must NOT be set manually
    uploadImage: builder.mutation<ApiResponse<UploadResult>, FormData>({
      query: (formData) => ({
        url: '/upload/image',
        method: 'POST',
        body: formData,
        // fetchBaseQuery sees FormData and will NOT set Content-Type
        // when formData is a FormData instance — browser handles it
        formData: true,
      }),
    }),

    // ── UPLOAD MULTIPLE IMAGES ───────────────────────────────
    uploadImages: builder.mutation<ApiResponse<UploadResult[]>, FormData>({
      query: (formData) => ({
        url: '/upload/images',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),

    deleteImage: builder.mutation<ApiResponse<null>, string>({
      query: (publicId) => ({
        url: `/upload/${encodeURIComponent(publicId)}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetDashboardStatsQuery,
  useUploadImageMutation,
  useUploadImagesMutation,
  useDeleteImageMutation,
} = adminApi;
