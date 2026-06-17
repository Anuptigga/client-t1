import { apiSlice } from '../../app/api.js';

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create review
    createReview: builder.mutation({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        'Review',
        { type: 'Kitchen', id: result?.data?.review?.kitchen },
      ],
    }),

    // Get kitchen reviews
    getKitchenReviews: builder.query({
      query: ({ kitchenId, page = 1, limit = 10 }) =>
        `/reviews/kitchen/${kitchenId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { kitchenId }) => [
        { type: 'Review', id: kitchenId },
      ],
    }),

    // Check if user can review
    canReviewOrder: builder.query({
      query: (orderId) => `/reviews/can-review/${orderId}`,
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetKitchenReviewsQuery,
  useCanReviewOrderQuery,
} = reviewApi;
