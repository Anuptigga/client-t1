import { ChefHat, Star, MapPin, Clock } from 'lucide-react';

/**
 * Kitchen marker dot displayed on the map grid.
 * Shows a small branded indicator with kitchen name.
 */
export default function KitchenMarker({ kitchen, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative group cursor-pointer
        transform transition-all duration-200
        ${isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'}
      `}
      title={kitchen.name}
    >
      {/* Pin */}
      <div
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-lg
          border-2 transition-all duration-200
          ${isSelected
            ? 'bg-primary-500 text-white border-primary-600 shadow-primary-500/30'
            : 'bg-white text-surface-800 border-surface-100 hover:border-primary-300 hover:shadow-xl'
          }
        `}
      >
        {kitchen.coverImage ? (
          <img
            src={kitchen.coverImage}
            alt={kitchen.name}
            className="w-7 h-7 rounded-lg object-cover"
          />
        ) : (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-white/20' : 'bg-primary-50'
          }`}>
            <ChefHat className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary-500'}`} />
          </div>
        )}
        <span className="text-xs font-semibold max-w-[80px] truncate">
          {kitchen.name}
        </span>
        {kitchen.rating?.average > 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${
            isSelected ? 'text-white/90' : 'text-yellow-500'
          }`}>
            <Star className="w-3 h-3 fill-current" />
            {kitchen.rating.average.toFixed(1)}
          </span>
        )}
      </div>

      {/* Arrow pointer */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 -bottom-1.5
          w-3 h-3 rotate-45 border-r-2 border-b-2
          ${isSelected
            ? 'bg-primary-500 border-primary-600'
            : 'bg-white border-surface-100'
          }
        `}
      />
    </button>
  );
}
