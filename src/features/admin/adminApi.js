import { apiSlice } from '../../app/api.js';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewStats: builder.query({
      query: () => '/admin/overview',
      providesTags: ['Admin', 'Kitchen', 'User', 'Order'],
    }),

    getKitchens: builder.query({
      query: ({ page = 1, limit = 10, status } = {}) => {
        let url = `/admin/kitchens?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: ['Kitchen'],
    }),

    moderateKitchen: builder.mutation({
      query: ({ id, isApproved, reason }) => ({
        url: `/admin/kitchens/${id}/moderate`,
        method: 'PUT',
        body: { isApproved, reason },
      }),
      invalidatesTags: ['Kitchen'],
    }),

    getUsers: builder.query({
      query: ({ page = 1, limit = 20, role } = {}) => {
        let url = `/admin/users?page=${page}&limit=${limit}`;
        if (role) url += `&role=${role}`;
        return url;
      },
      providesTags: ['User'],
    }),

    getGlobalOrders: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => `/admin/orders?page=${page}&limit=${limit}`,
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOverviewStatsQuery,
  useGetKitchensQuery,
  useModerateKitchenMutation,
  useGetUsersQuery,
  useGetGlobalOrdersQuery,
} = adminApi;
