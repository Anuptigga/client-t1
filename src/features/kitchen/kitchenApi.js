import { apiSlice } from '../../app/api.js';

export const kitchenApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public: Get nearby kitchens
    getNearbyKitchens: builder.query({
      query: ({ latitude, longitude, radius }) =>
        `/kitchens/nearby?latitude=${latitude}&longitude=${longitude}${radius ? `&radius=${radius}` : ''}`,
      providesTags: ['Kitchen'],
    }),

    // Public: Get single kitchen
    getKitchenById: builder.query({
      query: (id) => `/kitchens/${id}`,
      providesTags: (result, error, id) => [{ type: 'Kitchen', id }],
    }),

    // Kitchen owner: Register
    registerKitchen: builder.mutation({
      query: (data) => ({
        url: '/kitchens/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Kitchen'],
    }),

    // Kitchen owner: Get my kitchen
    getMyKitchen: builder.query({
      query: () => '/kitchens/me',
      providesTags: ['Kitchen'],
    }),

    // Kitchen owner: Update
    updateMyKitchen: builder.mutation({
      query: (data) => ({
        url: '/kitchens/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Kitchen'],
    }),

    // Kitchen owner: Toggle status
    toggleKitchenStatus: builder.mutation({
      query: () => ({
        url: '/kitchens/me/toggle',
        method: 'PATCH',
      }),
      invalidatesTags: ['Kitchen'],
    }),
  }),
});

export const {
  useGetNearbyKitchensQuery,
  useGetKitchenByIdQuery,
  useRegisterKitchenMutation,
  useGetMyKitchenQuery,
  useUpdateMyKitchenMutation,
  useToggleKitchenStatusMutation,
} = kitchenApi;
