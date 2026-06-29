import { apiSlice } from '../../app/api.js';

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get wallet balance and transactions
    getWalletData: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/wallet?page=${page}&limit=${limit}`,
      providesTags: ['Wallet'],
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
  useWithdrawFundsMutation,
} = walletApi;
