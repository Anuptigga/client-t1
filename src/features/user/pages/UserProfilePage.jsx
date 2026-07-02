import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Phone, MapPin, Camera, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import { selectCurrentUser, setCredentials } from '../../auth/authSlice.js';
import { useUpdateProfileMutation } from '../userApi.js';
import { useUploadImageMutation } from '../../kitchen/foodApi.js';

export default function UserProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadImage({ file, category: 'avatar' }).unwrap();
      setAvatar(res.data.url);
      toast.success('Avatar uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');

    try {
      const trimmedPhone = phone ? phone.trim() : '';
      const res = await updateProfile({ name, phone: trimmedPhone, avatar }).unwrap();
      dispatch(setCredentials({ user: res.data.user }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-800 mb-6">My Profile</h1>

        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar upload */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-100 border-4 border-white shadow-sm flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-surface-400" />
                  )}
                </div>
                
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-surface-800">Profile Picture</h3>
                <p className="text-sm text-surface-500 mb-2">JPG, PNG or WEBP. Max 5MB.</p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-surface-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-surface-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-surface-400" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-surface-100 bg-surface-50 text-surface-500 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-surface-400">Email cannot be changed.</p>
            </div>

            <div className="pt-4 border-t border-surface-100 flex justify-end">
              <Button type="submit" isLoading={updating} className="px-8">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Default Location Section */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft mt-8">
          <h2 className="text-xl font-bold text-surface-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            Default Delivery Address
          </h2>
          
          <LocationForm user={user} />
        </div>
      </div>
    </PageShell>
  );
}

function LocationForm({ user }) {
  const dispatch = useDispatch();
  const [street, setStreet] = useState(user?.defaultAddress?.street || '');
  const [city, setCity] = useState(user?.defaultAddress?.city || '');
  const [state, setState] = useState(user?.defaultAddress?.state || '');
  const [pincode, setPincode] = useState(user?.defaultAddress?.pincode || '');
  const [coords, setCoords] = useState(
    user?.location?.coordinates
      ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] } // [lng, lat]
      : null
  );

  const [updateLocation, { isLoading }] = useUpdateUserLocationMutation();
  const [geoLoading, setGeoLoading] = useState(false);

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
        toast.success('GPS coordinates captured');
      },
      (err) => {
        setGeoLoading(false);
        toast.error('Failed to get location. Please allow permissions.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!coords) return toast.error('Please capture your GPS location first');
    
    try {
      const res = await updateLocation({
        latitude: coords.lat,
        longitude: coords.lng,
        street,
        city,
        state,
        pincode,
      }).unwrap();
      
      dispatch(setCredentials({ user: res.data.user }));
      toast.success('Default location updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update location');
    }
  };

  return (
    <form onSubmit={handleSaveLocation} className="space-y-6">
      <div className="bg-surface-50 p-4 rounded-xl border border-surface-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-surface-800">GPS Coordinates</p>
          <p className="text-xs text-surface-500">
            {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Not set'}
          </p>
        </div>
        <Button
          type="button"
          variant={coords ? 'outline' : 'primary'}
          onClick={handleCaptureGPS}
          isLoading={geoLoading}
          className="text-xs px-3 py-1.5"
        >
          {coords ? 'Recapture GPS' : 'Capture GPS'}
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-semibold text-surface-700">Street Address</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            placeholder="123 Gandhi Road"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-surface-700">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            placeholder="Delhi"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-surface-700">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            placeholder="Delhi"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-surface-700">Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            placeholder="110001"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-surface-100 flex justify-end">
        <Button type="submit" isLoading={isLoading} className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Save Address
        </Button>
      </div>
    </form>
  );
}
