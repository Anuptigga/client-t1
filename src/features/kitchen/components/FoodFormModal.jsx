import { useState, useEffect, useRef } from 'react';
import { X, Upload, ImagePlus, Loader2 } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import { useCreateFoodMutation, useUpdateFoodMutation, useUploadImageMutation } from '../foodApi.js';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Main Course', 'Snacks', 'Breakfast', 'Lunch Thali', 'Dinner Thali',
  'Rice & Biryani', 'Breads', 'Desserts', 'Beverages', 'Salads', 'Other',
];

export default function FoodFormModal({ food, onClose }) {
  const isEdit = !!food;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    isVeg: true,
    totalQuantity: '',
    preparationTime: '30',
    image: '',
  });

  const [createFood, { isLoading: creating }] = useCreateFoodMutation();
  const [updateFood, { isLoading: updating }] = useUpdateFoodMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name || '',
        description: food.description || '',
        price: String(food.price || ''),
        category: food.category || 'Main Course',
        isVeg: food.isVeg !== undefined ? food.isVeg : true,
        totalQuantity: String(food.totalQuantity || ''),
        preparationTime: String(food.preparationTime || '30'),
        image: food.image || '',
      });
    }
  }, [food]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImage({ file, category: 'food' }).unwrap();
      setFormData((prev) => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error('Name is required');
    if (!formData.price || Number(formData.price) < 1) return toast.error('Valid price is required');
    if (!formData.totalQuantity || Number(formData.totalQuantity) < 1) return toast.error('Quantity is required');

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      isVeg: formData.isVeg,
      totalQuantity: Number(formData.totalQuantity),
      preparationTime: Number(formData.preparationTime),
      image: formData.image,
    };

    try {
      if (isEdit) {
        await updateFood({ id: food._id, ...payload }).unwrap();
        toast.success('Food item updated');
      } else {
        await createFood(payload).unwrap();
        toast.success('Food item created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const isLoading = creating || updating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-surface-800">
            {isEdit ? 'Edit Food Item' : 'Add New Food Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Food Image
            </label>
            <div className="relative">
              {formData.image ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                  <img
                    src={formData.image}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-white/90 rounded-lg text-sm font-medium text-surface-700 hover:bg-white transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                      className="px-3 py-2 bg-red-500/90 rounded-lg text-sm font-medium text-white hover:bg-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-40 border-2 border-dashed border-surface-200 rounded-xl flex flex-col items-center justify-center text-surface-400 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50/50 transition-all"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload image</span>
                      <span className="text-xs mt-0.5">JPEG, PNG, WebP • Max 5MB</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <Input
            id="food-name"
            label="Food Name"
            name="name"
            placeholder="e.g., Dal Makhani"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="food-description"
              name="description"
              rows={2}
              placeholder="Rich, creamy lentil dish..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Price + Quantity row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="food-price"
              label="Price (₹)"
              name="price"
              type="number"
              placeholder="150"
              min="1"
              value={formData.price}
              onChange={handleChange}
            />
            <Input
              id="food-quantity"
              label="Daily Quantity"
              name="totalQuantity"
              type="number"
              placeholder="20"
              min="1"
              value={formData.totalQuantity}
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Category
            </label>
            <select
              id="food-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Prep time + Veg row */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <Input
              id="food-prep-time"
              label="Prep Time (mins)"
              name="preparationTime"
              type="number"
              placeholder="30"
              min="5"
              max="180"
              value={formData.preparationTime}
              onChange={handleChange}
            />
            <div className="pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isVeg"
                    checked={formData.isVeg}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-red-200 rounded-full peer-checked:bg-green-400 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-medium text-surface-700">
                  {formData.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-[2]">
              {isEdit ? 'Save Changes' : 'Add to Menu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
