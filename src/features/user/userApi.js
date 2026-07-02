import { apiSlice } from '../../app/api.js';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Update user profile
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Update location
    updateUserLocation: builder.mutation({
      query: ({ latitude, longitude, street, city, state, pincode }) => ({
        url: '/users/location',
        method: 'PUT',
        body: { latitude, longitude, street, city, state, pincode },
      }),
      invalidatesTags: ['User'],
    }),

    // Update bank details
    updateBankDetails: builder.mutation({
      query: (data) => ({
        url: '/users/bank-details',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useUpdateUserLocationMutation,
  useUpdateBankDetailsMutation,
} = userApi;
