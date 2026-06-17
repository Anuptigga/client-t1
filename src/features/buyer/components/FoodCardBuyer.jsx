import { ChefHat, Clock, ShoppingBag } from 'lucide-react';

/**
 * Food item card for buyer view (used on kitchen detail page).
 */
export default function FoodCardBuyer({ food, onAddToCart }) {
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
      food.isSoldOut
        ? 'border-surface-200 opacity-60'
        : 'border-surface-100 hover:shadow-card hover:border-surface-200'
    }`}>
      <div className="flex gap-4 p-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${
              food.isVeg ? 'border-green-500' : 'border-red-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
            </span>
            <h4 className="text-sm font-semibold text-surface-800 truncate">
              {food.name}
            </h4>
          </div>

          {food.description && (
            <p className="text-xs text-surface-400 line-clamp-2 mb-2">
              {food.description}
            </p>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-surface-800">₹{food.price}</span>
            <span className="flex items-center gap-1 text-xs text-surface-400">
              <Clock className="w-3 h-3" />
              {food.preparationTime} min
            </span>
          </div>

          {/* Add to cart button - placeholder for Stage 4 */}
          {!food.isSoldOut && (
            <button
              onClick={() => onAddToCart?.(food)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add
            </button>
          )}

          {food.isSoldOut && (
            <span className="mt-3 inline-block text-xs font-semibold text-red-500">
              Sold Out
            </span>
          )}
        </div>

        {/* Image */}
        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              className={`w-full h-full object-cover ${food.isSoldOut ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-primary-50 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
