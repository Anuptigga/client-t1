import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base API slice for RTK Query.
 * All feature API slices inject endpoints into this base.
 *
 * Uses Authorization header for cross-origin deployments (Vercel + Render)
 * where third-party cookies are blocked by modern browsers.
 * Also keeps credentials: 'include' as fallback for same-origin / local dev.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || ''}/api/v1`,
    credentials: 'include', // still send cookies (works for same-origin / local dev)
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Kitchen', 'Food', 'FoodStats', 'Order', 'DeliveryOrders', 'ActiveDelivery', 'DeliveryHistory', 'Review', 'Wallet', 'Notification'],
  endpoints: () => ({}),
});

