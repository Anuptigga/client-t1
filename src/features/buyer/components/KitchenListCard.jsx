import { Star, MapPin, ChefHat } from 'lucide-react';

/**
 * Compact kitchen card for the sidebar list.
 */
export default function KitchenListCard({ kitchen, isSelected, onClick }) {
  const isActive = kitchen.isApproved && kitchen.isOpen && !kitchen.isAutoPaused;

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex gap-3 p-3 rounded-xl text-left transition-all duration-200
        ${isSelected
          ? 'bg-primary-50 border-2 border-primary-300 shadow-sm'
          : 'bg-white border-2 border-transparent hover:bg-surface-50 hover:border-surface-200'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
        {kitchen.coverImage ? (
          <img
            src={kitchen.coverImage}
            alt={kitchen.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-50 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-surface-800 truncate">
            {kitchen.name}
          </h4>
          <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green-400' : 'bg-surface-300'}`} />
        </div>

        {kitchen.cuisineTypes?.length > 0 && (
          <p className="text-xs text-surface-400 truncate mt-0.5">
            {kitchen.cuisineTypes.join(' · ')}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          {kitchen.rating?.count > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-yellow-600">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              {kitchen.rating.average.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-xs text-surface-400">
            <MapPin className="w-3 h-3" />
            {kitchen.address?.city}
          </span>
        </div>
      </div>
    </button>
  );
}
