import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base API slice for RTK Query.
 * All feature API slices inject endpoints into this base.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include', // send cookies with every request
  }),
  tagTypes: ['User', 'Kitchen', 'Food', 'FoodStats', 'Order', 'DeliveryOrders', 'ActiveDelivery', 'DeliveryHistory', 'Review', 'Wallet', 'Notification'],
  endpoints: () => ({}),
});
