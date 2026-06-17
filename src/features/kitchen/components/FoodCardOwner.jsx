import { useState } from 'react';
import { Edit3, Trash2, Minus, Plus, ChefHat, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpdateFoodQuantityMutation, useDeleteFoodMutation } from '../foodApi.js';

export default function FoodCardOwner({ food, onEdit }) {
  const [deleteFood, { isLoading: deleting }] = useDeleteFoodMutation();
  const [updateQuantity, { isLoading: updatingQty }] = useUpdateFoodQuantityMutation();
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteFood(food._id).unwrap();
      toast.success('Food item deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleQuantityChange = async (delta) => {
    const newQty = Math.max(0, Math.min(food.totalQuantity, food.availableQuantity + delta));
    if (newQty === food.availableQuantity) return;

    try {
      await updateQuantity({ id: food._id, availableQuantity: newQty }).unwrap();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${
      food.isSoldOut
        ? 'border-red-200 bg-red-50/30'
        : !food.isAvailable
        ? 'border-surface-200 opacity-60'
        : 'border-surface-100 hover:shadow-card'
    }`}>
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm border-2 ${
                  food.isVeg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'
                }`}>
                  <span className="block w-1 h-1 bg-white rounded-full mx-auto mt-[3px]" />
                </span>
                <h4 className="text-sm font-semibold text-surface-800 truncate">
                  {food.name}
                </h4>
              </div>
              <p className="text-xs text-surface-400 mt-0.5">{food.category}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(food)}
                className="p-1.5 text-surface-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDelete(!showDelete)}
                className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price + Prep time */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-bold text-surface-800">
              ₹{food.price}
            </span>
            <span className="flex items-center gap-1 text-xs text-surface-400">
              <Clock className="w-3 h-3" />
              {food.preparationTime}m
            </span>
          </div>
        </div>
      </div>

      {/* Quantity control bar */}
      <div className={`px-4 py-3 border-t flex items-center justify-between ${
        food.isSoldOut ? 'border-red-200 bg-red-50/50' : 'border-surface-100 bg-surface-50'
      }`}>
        <div className="flex items-center gap-2">
          {food.isSoldOut ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
              <AlertTriangle className="w-3.5 h-3.5" />
              SOLD OUT
            </span>
          ) : (
            <span className="text-xs text-surface-500">
              Stock: <span className="font-semibold text-surface-700">{food.availableQuantity}</span>
              <span className="text-surface-400">/{food.totalQuantity}</span>
            </span>
          )}
        </div>

        {/* Quantity stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={food.availableQuantity <= 0 || updatingQty}
            className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-surface-700">
            {food.availableQuantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={food.availableQuantity >= food.totalQuantity || updatingQty}
            className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="px-4 py-3 border-t border-red-200 bg-red-50 flex items-center justify-between">
          <p className="text-xs text-red-600 font-medium">Delete this item?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDelete(false)}
              className="px-3 py-1.5 text-xs font-medium text-surface-600 bg-white rounded-lg hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
