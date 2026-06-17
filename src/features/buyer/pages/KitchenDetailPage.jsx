import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ChefHat, Star, MapPin, Clock, ArrowLeft, Phone, Loader2, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import FoodCardBuyer from '../components/FoodCardBuyer.jsx';
import { useGetKitchenByIdQuery } from '../../kitchen/kitchenApi.js';
import { useGetKitchenFoodsQuery } from '../../kitchen/foodApi.js';
import { addToCart } from '../../cart/cartSlice.js';
import KitchenReviews from '../../review/KitchenReviews.jsx';

export default function KitchenDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const reviewableOrderId = searchParams.get('review');
  const dispatch = useDispatch();
  const { data, isLoading, error } = useGetKitchenByIdQuery(id);
  const { data: foodsData, isLoading: foodsLoading } = useGetKitchenFoodsQuery(id);
  const kitchen = data?.data?.kitchen;
  const foods = foodsData?.data?.foods || [];
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'nonveg'

  const filteredFoods = useMemo(() => {
    if (vegFilter === 'veg') return foods.filter((f) => f.isVeg);
    if (vegFilter === 'nonveg') return foods.filter((f) => !f.isVeg);
    return foods;
  }, [foods, vegFilter]);

  const groupedFoods = useMemo(() => {
    const groups = {};
    filteredFoods.forEach((food) => {
      if (!groups[food.category]) groups[food.category] = [];
      groups[food.category].push(food);
    });
    return groups;
  }, [filteredFoods]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (error || !kitchen) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <ChefHat className="w-16 h-16 text-surface-300 mb-4" />
          <h2 className="text-xl font-bold text-surface-700 mb-2">Kitchen not found</h2>
          <p className="text-surface-500 mb-6">This kitchen may no longer be available.</p>
          <Link to="/explore">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const isActive = kitchen.isApproved && kitchen.isOpen && !kitchen.isAutoPaused;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
          {/* Cover */}
          <div className="relative h-48 sm:h-64 overflow-hidden">
            {kitchen.coverImage ? (
              <img
                src={kitchen.coverImage}
                alt={kitchen.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-white/50" />
              </div>
            )}

            {/* Status badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                  isActive
                    ? 'bg-green-500/90 text-white'
                    : 'bg-red-500/90 text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-200' : 'bg-red-200'}`} />
                {isActive ? 'Open Now' : 'Closed'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-800">
                  {kitchen.name}
                </h1>
                {kitchen.cuisineTypes?.length > 0 && (
                  <p className="text-surface-500 mt-1">
                    {kitchen.cuisineTypes.join(' · ')}
                  </p>
                )}
              </div>

              {kitchen.rating?.count > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold text-yellow-700">
                    {kitchen.rating.average.toFixed(1)}
                  </span>
                  <span className="text-sm text-yellow-600">
                    ({kitchen.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>

            {kitchen.description && (
              <p className="text-surface-600 mt-4 leading-relaxed">
                {kitchen.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-surface-100 text-sm text-surface-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500" />
                {kitchen.address?.street}, {kitchen.address?.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-500" />
                {kitchen.operatingHours?.open} – {kitchen.operatingHours?.close}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary-500" />
                {kitchen.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Menu section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-surface-800 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary-500" />
              Menu
            </h2>

            {/* Veg/Non-veg filter */}
            <div className="flex bg-surface-100 rounded-xl p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'veg', label: '🟢 Veg' },
                { key: 'nonveg', label: '🔴 Non-Veg' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setVegFilter(opt.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    vegFilter === opt.key
                      ? 'bg-white text-surface-800 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {foodsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-100 p-8 text-center">
              <ChefHat className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-surface-700 mb-1">No items available</h3>
              <p className="text-sm text-surface-400">
                {foods.length === 0
                  ? 'This kitchen hasn\'t added any menu items yet.'
                  : 'No items match your filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFoods).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
                    {category}
                    <span className="text-xs font-normal text-surface-400 ml-2">({items.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {items.map((food) => (
                      <FoodCardBuyer
                        key={food._id}
                        food={food}
                        onAddToCart={(f) => {
                          dispatch(addToCart({
                            kitchenId: id,
                            kitchenName: kitchen.name,
                            food: f,
                          }));
                          toast.success(`${f.name} added to cart`);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews section */}
        <div className="mt-8" id="reviews">
          <KitchenReviews kitchenId={id} reviewableOrderId={reviewableOrderId} />
        </div>
      </div>
    </PageShell>
  );
}
