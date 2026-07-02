import { apiSlice } from '../../app/api.js';

export const deliveryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Toggle availability
    toggleDeliveryAvailability: builder.mutation({
      query: (isActive) => ({
        url: '/delivery/availability',
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),

    // Update location
    updateDeliveryLocation: builder.mutation({
      query: ({ latitude, longitude }) => ({
        url: '/delivery/location',
        method: 'PATCH',
        body: { latitude, longitude },
      }),
    }),

    // Get available orders for pickup (filtered by driver location)
    getAvailableOrders: builder.query({
      query: ({ latitude, longitude } = {}) => {
        const params = new URLSearchParams();
        if (latitude) params.set('latitude', latitude);
        if (longitude) params.set('longitude', longitude);
        return `/delivery/available-orders?${params}`;
      },
      providesTags: ['DeliveryOrders'],
    }),

    // Get active delivery
    getActiveDelivery: builder.query({
      query: () => '/delivery/active',
      providesTags: ['ActiveDelivery'],
    }),

    // Accept delivery
    acceptDelivery: builder.mutation({
      query: (orderId) => ({
        url: `/delivery/accept/${orderId}`,
        method: 'POST',
      }),
      invalidatesTags: ['DeliveryOrders', 'ActiveDelivery', 'Order'],
    }),

    // Mark picked up
    markPickedUp: builder.mutation({
      query: (orderId) => ({
        url: `/delivery/pickup/${orderId}`,
        method: 'POST',
      }),
      invalidatesTags: ['ActiveDelivery', 'Order'],
    }),

    // Mark delivered
    markDelivered: builder.mutation({
      query: ({ orderId, otp }) => ({
        url: `/delivery/deliver/${orderId}`,
        method: 'POST',
        body: { otp },
      }),
      invalidatesTags: ['ActiveDelivery', 'Order', 'DeliveryHistory', 'Wallet'],
    }),

    // Delivery history
    getDeliveryHistory: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/delivery/history?page=${page}&limit=${limit}`,
      providesTags: ['DeliveryHistory'],
    }),
  }),
});

export const {
  useToggleDeliveryAvailabilityMutation,
  useUpdateDeliveryLocationMutation,
  useGetAvailableOrdersQuery,
  useGetActiveDeliveryQuery,
  useAcceptDeliveryMutation,
  useMarkPickedUpMutation,
  useMarkDeliveredMutation,
  useGetDeliveryHistoryQuery,
} = deliveryApi;
