import { apiSlice } from '../../app/api.js';

export const foodApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public: Get food items for a kitchen
    getKitchenFoods: builder.query({
      query: (kitchenId) => `/foods/kitchen/${kitchenId}`,
      providesTags: (result, error, kitchenId) => [
        { type: 'Food', id: `KITCHEN_${kitchenId}` },
        ...(result?.data?.foods?.map((f) => ({ type: 'Food', id: f._id })) || []),
      ],
    }),

    // Kitchen owner: Get my menu (includes unavailable items)
    getMyMenu: builder.query({
      query: () => '/foods/my-menu',
      providesTags: ['Food'],
    }),

    // Kitchen owner: Get menu stats
    getMyFoodStats: builder.query({
      query: () => '/foods/my-stats',
      providesTags: ['FoodStats'],
    }),

    // Kitchen owner: Create food item
    createFood: builder.mutation({
      query: (data) => ({
        url: '/foods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Food', 'FoodStats'],
    }),

    // Kitchen owner: Update food item
    updateFood: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/foods/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Food', id },
        'Food',
        'FoodStats',
      ],
    }),

    // Kitchen owner: Update quantity
    updateFoodQuantity: builder.mutation({
      query: ({ id, availableQuantity }) => ({
        url: `/foods/${id}/quantity`,
        method: 'PATCH',
        body: { availableQuantity },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Food', id },
        'Food',
        'FoodStats',
      ],
    }),

    // Kitchen owner: Delete food item
    deleteFood: builder.mutation({
      query: (id) => ({
        url: `/foods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Food', 'FoodStats'],
    }),

    // Kitchen owner: Reset daily quantities
    resetDailyQuantities: builder.mutation({
      query: (data) => ({
        url: '/foods/reset-quantities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Food', 'FoodStats'],
    }),

    // Upload image
    uploadImage: builder.mutation({
      query: ({ file, category = 'food' }) => {
        const formData = new FormData();
        formData.append('image', file);
        return {
          url: `/upload/image?category=${category}`,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetKitchenFoodsQuery,
  useGetMyMenuQuery,
  useGetMyFoodStatsQuery,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useUpdateFoodQuantityMutation,
  useDeleteFoodMutation,
  useResetDailyQuantitiesMutation,
  useUploadImageMutation,
} = foodApi;
