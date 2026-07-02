import { useState, useEffect, useRef } from 'react';
import { ChefHat, Phone, Clock, Utensils, MapPin, Upload, Image as ImageIcon, Save, Loader2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import { useGetMyKitchenQuery, useUpdateMyKitchenMutation } from '../kitchenApi.js';
import { useUploadImageMutation } from '../foodApi.js';

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Rajasthani',
  'Punjabi', 'Mughlai', 'Chinese', 'Continental', 'Street Food',
  'Snacks', 'Desserts', 'Beverages', 'Biryani', 'Healthy/Diet',
];

export default function KitchenSettingsPage() {
  const { data: kitchenData, isLoading: isLoadingKitchen } = useGetMyKitchenQuery();
  const [updateKitchen, { isLoading: isUpdating }] = useUpdateMyKitchenMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    coverImage: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    openTime: '09:00',
    closeTime: '21:00',
    cuisineTypes: [],
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (kitchenData?.data?.kitchen) {
      const k = kitchenData.data.kitchen;
      setFormData({
        name: k.name || '',
        description: k.description || '',
        phone: k.phone || '',
        coverImage: k.coverImage || '',
        street: k.address?.street || '',
        city: k.address?.city || '',
        state: k.address?.state || '',
        pincode: k.address?.pincode || '',
        openTime: k.operatingHours?.open || '09:00',
        closeTime: k.operatingHours?.close || '21:00',
        cuisineTypes: k.cuisineTypes || [],
      });
    }
  }, [kitchenData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const toggleCuisine = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Kitchen name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    try {
      const res = await uploadImage({ file, category: 'kitchen' }).unwrap();
      setFormData((prev) => ({ ...prev, coverImage: res.data.url }));
      toast.success('Cover image uploaded');
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      await updateKitchen({
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        coverImage: formData.coverImage,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        operatingHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
        cuisineTypes: formData.cuisineTypes,
      }).unwrap();

      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  if (isLoadingKitchen) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary-500" />
              Kitchen Settings
            </h1>
            <p className="text-surface-500 text-sm mt-1">
              Update your kitchen profile, operating hours, and address.
            </p>
          </div>
          <Button onClick={handleSubmit} isLoading={isUpdating}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Image & Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6">
              <h3 className="text-sm font-semibold text-surface-800 uppercase tracking-wide mb-4">Cover Image</h3>
              <div className="flex flex-col items-center">
                <div 
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center bg-surface-50 cursor-pointer hover:bg-surface-100 transition-colors overflow-hidden relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.coverImage ? (
                    <>
                      <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-surface-400 mb-2" />
                          <span className="text-xs text-surface-500 font-medium text-center">Click to upload cover image</span>
                        </>
                      )}
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6">
              <h3 className="text-sm font-semibold text-surface-800 uppercase tracking-wide mb-4">Basic Info</h3>
              <div className="space-y-4">
                <Input
                  id="kitchen-name"
                  label="Kitchen Name"
                  name="name"
                  icon={ChefHat}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                <Input
                  id="kitchen-phone"
                  label="Kitchen Phone"
                  name="phone"
                  type="tel"
                  icon={Phone}
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700">
                    Description
                  </label>
                  <textarea
                    id="kitchen-description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Address, Hours, Cuisine */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Address */}
            <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-surface-800">Address Details</h3>
              </div>
              <div className="space-y-4">
                <Input
                  id="kitchen-street"
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  error={errors.street}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="kitchen-city"
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                  />
                  <Input
                    id="kitchen-state"
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    error={errors.state}
                  />
                </div>
                <div className="w-1/2 pr-2">
                  <Input
                    id="kitchen-pincode"
                    label="Pincode"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                  />
                </div>
                <p className="text-xs text-surface-400 italic">
                  Note: Updating your address will not automatically change your exact GPS pin on the map.
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-surface-800">Operating Hours</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1">Opens at</label>
                  <input
                    id="kitchen-open-time"
                    type="time"
                    name="openTime"
                    value={formData.openTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1">Closes at</label>
                  <input
                    id="kitchen-close-time"
                    type="time"
                    name="closeTime"
                    value={formData.closeTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Cuisine Types */}
            <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-surface-800">Cuisine Types</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((cuisine) => {
                  const isSelected = formData.cuisineTypes.includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`
                        px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        ${isSelected
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }
                      `}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageShell>
  );
}
