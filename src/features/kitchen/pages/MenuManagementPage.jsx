import { useState, useMemo } from 'react';
import { Plus, Search, ChefHat, RefreshCw, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import FoodCardOwner from '../components/FoodCardOwner.jsx';
import FoodFormModal from '../components/FoodFormModal.jsx';
import { useGetMyMenuQuery, useResetDailyQuantitiesMutation } from '../foodApi.js';

const FILTER_OPTIONS = ['All', 'Available', 'Sold Out', 'Hidden'];

export default function MenuManagementPage() {
  const { data, isLoading, error } = useGetMyMenuQuery();
  const [resetQuantities, { isLoading: resetting }] = useResetDailyQuantitiesMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const foods = data?.data?.foods || [];

  // Filter and search
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Apply filter
    if (filter === 'Available') {
      result = result.filter((f) => f.isAvailable && !f.isSoldOut);
    } else if (filter === 'Sold Out') {
      result = result.filter((f) => f.isSoldOut);
    } else if (filter === 'Hidden') {
      result = result.filter((f) => !f.isAvailable);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [foods, filter, search]);

  // Group by category
  const groupedFoods = useMemo(() => {
    const groups = {};
    filteredFoods.forEach((food) => {
      if (!groups[food.category]) groups[food.category] = [];
      groups[food.category].push(food);
    });
    return groups;
  }, [filteredFoods]);

  const handleEdit = (food) => {
    setEditingFood(food);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFood(null);
  };

  const handleResetAll = async () => {
    if (!foods.length) return;

    const items = foods
      .filter((f) => f.isAvailable)
      .map((f) => ({
        foodId: f._id,
        totalQuantity: f.totalQuantity,
      }));

    try {
      await resetQuantities({ items }).unwrap();
      toast.success('All quantities reset for the day!');
    } catch {
      toast.error('Failed to reset quantities');
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-800">Menu Management</h1>
            <p className="text-surface-500 text-sm mt-0.5">
              {foods.length} item{foods.length !== 1 ? 's' : ''} in your menu
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              isLoading={resetting}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset Daily Stock
            </Button>
            <Button size="sm" onClick={() => { setEditingFood(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              id="menu-search"
            />
          </div>

          <div className="flex bg-surface-100 rounded-xl p-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  filter === opt
                    ? 'bg-white text-surface-800 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Food items */}
        {filteredFoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ChefHat className="w-16 h-16 text-surface-300 mb-4" />
            <h3 className="text-lg font-bold text-surface-700 mb-2">
              {foods.length === 0 ? 'No menu items yet' : 'No items match your filter'}
            </h3>
            <p className="text-sm text-surface-500 max-w-sm mb-6">
              {foods.length === 0
                ? 'Start building your menu by adding your first food item.'
                : 'Try changing the filter or search query.'}
            </p>
            {foods.length === 0 && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFoods).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" />
                  {category}
                  <span className="text-xs font-normal text-surface-400">
                    ({items.length})
                  </span>
                </h3>
                <div className="space-y-3">
                  {items.map((food) => (
                    <FoodCardOwner
                      key={food._id}
                      food={food}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Food form modal */}
      {showForm && (
        <FoodFormModal food={editingFood} onClose={handleCloseForm} />
      )}
    </PageShell>
  );
}
