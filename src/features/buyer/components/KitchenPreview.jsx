import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, ChefHat, ArrowRight, X } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';

/**
 * Preview card that appears when a kitchen marker is clicked on the map.
 * Shows key info and a link to the full kitchen page.
 */
export default function KitchenPreview({ kitchen, onClose }) {
  if (!kitchen) return null;

  const isActive = kitchen.isApproved && kitchen.isOpen && !kitchen.isAutoPaused;

  return (
    <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-elevated border border-surface-100 overflow-hidden">
        {/* Cover image or gradient */}
        <div className="relative h-32 overflow-hidden">
          {kitchen.coverImage ? (
            <img
              src={kitchen.coverImage}
              alt={kitchen.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-primary flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-white/80" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
              ${isActive
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
              }
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-200' : 'bg-red-200'}`} />
              {isActive ? 'Open Now' : 'Closed'}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-surface-800 truncate">
                {kitchen.name}
              </h3>
              {kitchen.cuisineTypes?.length > 0 && (
                <p className="text-sm text-surface-500 truncate mt-0.5">
                  {kitchen.cuisineTypes.join(' · ')}
                </p>
              )}
            </div>

            {/* Rating */}
            {kitchen.rating?.count > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 rounded-lg shrink-0">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-yellow-700">
                  {kitchen.rating.average.toFixed(1)}
                </span>
                <span className="text-xs text-yellow-600">
                  ({kitchen.rating.count})
                </span>
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-surface-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {kitchen.address?.city || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {kitchen.operatingHours?.open} – {kitchen.operatingHours?.close}
            </span>
          </div>

          {kitchen.description && (
            <p className="text-sm text-surface-500 mt-2 line-clamp-2">
              {kitchen.description}
            </p>
          )}

          {/* Action */}
          <Link to={`/kitchen/${kitchen._id}`}>
            <Button fullWidth className="mt-4" size="md">
              View Menu
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
