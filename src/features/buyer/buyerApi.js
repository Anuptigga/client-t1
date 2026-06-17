import { apiSlice } from '../../app/api.js';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateLocation: builder.mutation({
      query: (data) => ({
        url: '/users/location',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useUpdateLocationMutation,
  useUpdateProfileMutation,
} = userApi;
