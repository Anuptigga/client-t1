import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, MapPin, Phone, Clock, Utensils, ArrowRight, ArrowLeft, CheckCircle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import { useRegisterKitchenMutation } from '../kitchenApi.js';

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Rajasthani',
  'Punjabi', 'Mughlai', 'Chinese', 'Continental', 'Street Food',
  'Snacks', 'Desserts', 'Beverages', 'Biryani', 'Healthy/Diet',
];

export default function KitchenRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: basic info, 2: address, 3: hours & cuisine
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    openTime: '09:00',
    closeTime: '21:00',
    cuisineTypes: [],
    latitude: null,
    longitude: null,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [registerKitchen, { isLoading }] = useRegisterKitchenMutation();

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

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Kitchen name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    if (step === 2) {
      if (!formData.street.trim()) newErrors.street = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setIsLocating(false);
        toast.success('Exact location captured!');
      },
      (error) => {
        setIsLocating(false);
        toast.error('Failed to get location. Please check browser permissions.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    try {
      await registerKitchen({
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
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
        ...(formData.latitude && formData.longitude && {
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
      }).unwrap();

      toast.success('Kitchen registered! Pending admin approval.');
      navigate('/kitchen/dashboard');
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-64px)] bg-surface-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-800">
              Register Your Kitchen
            </h1>
            <p className="text-surface-500 mt-1">
              Start serving homemade food to your neighborhood
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Address' },
              { num: 3, label: 'Cuisine & Hours' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step >= s.num
                        ? 'gradient-primary text-white shadow-sm'
                        : 'bg-surface-200 text-surface-400'
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className="text-xs text-surface-500 mt-1 hidden sm:block">
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full mt-[-16px] sm:mt-0 transition-all duration-300 ${
                      step > s.num ? 'bg-primary-500' : 'bg-surface-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6 sm:p-8 animate-fade-in">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <Input
                  id="kitchen-name"
                  label="Kitchen Name"
                  name="name"
                  placeholder="e.g., Amma's Kitchen"
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
                  placeholder="+91 98765 43210"
                  icon={Phone}
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700">
                    Description (optional)
                  </label>
                  <textarea
                    id="kitchen-description"
                    name="description"
                    rows={3}
                    placeholder="Tell buyers about your kitchen..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
                  />
                </div>

                <Button onClick={handleNext} fullWidth size="lg">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-surface-700">Kitchen Location</h3>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLocateMe}
                    isLoading={isLocating}
                    className="text-xs py-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5" />
                    {formData.latitude ? 'Location Captured ✓' : 'Use Current Location'}
                  </Button>
                </div>
                <Input
                  id="kitchen-street"
                  label="Street Address"
                  name="street"
                  placeholder="123, Gandhi Road"
                  value={formData.street}
                  onChange={handleChange}
                  error={errors.street}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="kitchen-city"
                    label="City"
                    name="city"
                    placeholder="Delhi"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                  />
                  <Input
                    id="kitchen-state"
                    label="State"
                    name="state"
                    placeholder="Delhi"
                    value={formData.state}
                    onChange={handleChange}
                    error={errors.state}
                  />
                </div>
                <Input
                  id="kitchen-pincode"
                  label="Pincode"
                  name="pincode"
                  placeholder="110001"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  error={errors.pincode}
                />

                <p className="text-xs text-surface-400 bg-surface-50 rounded-lg p-3">
                  📍 {formData.latitude 
                      ? 'Exact GPS coordinates captured! Your address will be saved for display purposes.' 
                      : 'Your address will be geocoded to show your kitchen on the map. Click "Use Current Location" for better accuracy.'}
                  Buyers within 10 km will be able to discover you.
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-[2]">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Cuisine & Hours */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Operating Hours */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-surface-700">Operating Hours</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-surface-700">Cuisine Types</h3>
                  </div>
                  <p className="text-sm text-surface-400 mb-3">Select all that apply</p>
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

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} isLoading={isLoading} className="flex-[2]">
                    Register Kitchen
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Note */}
          <p className="text-center text-xs text-surface-400 mt-6 max-w-sm mx-auto">
            After registration, your kitchen will need admin approval before appearing on the map.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
