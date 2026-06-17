import { apiSlice } from '../../app/api.js';

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get wallet balance and transactions
    getWalletData: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/wallet?page=${page}&limit=${limit}`,
      providesTags: ['Wallet'],
    }),

    // Add funds
    addFunds: builder.mutation({
      query: ({ amount, referenceId }) => ({
        url: '/wallet/add',
        method: 'POST',
        body: { amount, referenceId },
      }),
      invalidatesTags: ['Wallet', 'User'],
    }),

    // Withdraw funds
    withdrawFunds: builder.mutation({
      query: (amount) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['Wallet', 'User'],
    }),
  }),
});

export const {
  useGetWalletDataQuery,
  useAddFundsMutation,
  useWithdrawFundsMutation,
} = walletApi;
