import { apiSlice } from '../../app/api.js';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Buyer: place order
    placeOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Food', 'FoodStats'],
    }),

    // Verify payment
    verifyPayment: builder.mutation({
      query: ({ orderId, paymentId, signature }) => ({
        url: `/orders/${orderId}/verify-payment`,
        method: 'POST',
        body: { paymentId, signature },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
      ],
    }),

    // Buyer: get my orders
    getMyOrders: builder.query({
      query: ({ page = 1, limit = 10, status } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (status) params.set('status', status);
        return `/orders/my-orders?${params}`;
      },
      providesTags: (result) => [
        'Order',
        ...(result?.orders?.map((o) => ({ type: 'Order', id: o._id })) || []),
      ],
    }),

    // Kitchen: get incoming orders
    getKitchenOrders: builder.query({
      query: ({ page = 1, limit = 20, status } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (status) params.set('status', status);
        return `/orders/kitchen-orders?${params}`;
      },
      providesTags: (result) => [
        'Order',
        ...(result?.orders?.map((o) => ({ type: 'Order', id: o._id })) || []),
      ],
    }),

    // Get single order
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Kitchen: update status
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, kitchenNote }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status, kitchenNote },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
        'Wallet',
      ],
    }),

    // Cancel order
    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
        'Food',
        'FoodStats',
      ],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrdersQuery,
  useGetKitchenOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = orderApi;
