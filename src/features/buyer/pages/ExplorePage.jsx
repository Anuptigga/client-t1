import { useState, useMemo, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Search, MapPin, ChefHat, Crosshair, List, Map as MapIcon, Loader2, AlertCircle } from 'lucide-react';
import PageShell from '../../../components/layout/PageShell.jsx';
import KitchenMarker from '../components/KitchenMarker.jsx';
import KitchenPreview from '../components/KitchenPreview.jsx';
import KitchenListCard from '../components/KitchenListCard.jsx';
import useGeolocation from '../../../hooks/useGeolocation.js';
import { useGetNearbyKitchensQuery } from '../../kitchen/kitchenApi.js';
import { GOOGLE_MAPS_API_KEY, MAP_ID, DEFAULT_CENTER, DEFAULT_ZOOM, isMapAvailable } from '../../../lib/mapConfig.js';

function MapRecenter({ center }) {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

  return null;
}

export default function ExplorePage() {
  const { location, loading: geoLoading, requestLocation, isDefault } = useGeolocation();
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch nearby kitchens once we have location
  const { data, isLoading, isFetching, error, refetch } = useGetNearbyKitchensQuery(
    location ? { latitude: location.latitude, longitude: location.longitude, radius: 10 } : undefined,
    { skip: !location }
  );

  const kitchens = data?.data?.kitchens || [];

  // Filter kitchens by search query
  const filteredKitchens = useMemo(() => {
    if (!searchQuery.trim()) return kitchens;
    const q = searchQuery.toLowerCase();
    return kitchens.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.cuisineTypes?.some((c) => c.toLowerCase().includes(q)) ||
        k.address?.city?.toLowerCase().includes(q)
    );
  }, [kitchens, searchQuery]);

  const mapCenter = useMemo(() => {
    if (location) return { lat: location.latitude, lng: location.longitude };
    return DEFAULT_CENTER;
  }, [location]);

  const handleMarkerClick = useCallback((kitchen) => {
    setSelectedKitchen((prev) => (prev?._id === kitchen._id ? null : kitchen));
  }, []);

  return (
    <PageShell>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center gap-3 z-20">
          {/* Search */}
          <div className="flex-1 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search kitchens, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              id="explore-search"
            />
          </div>

          {/* Re-center button */}
          <button
            onClick={requestLocation}
            title="Use my location"
            className="p-2.5 rounded-xl border border-surface-200 text-surface-500 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-50 transition-all"
          >
            <Crosshair className="w-5 h-5" />
          </button>

          {/* View toggle */}
          <div className="flex bg-surface-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'map' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-400 hover:text-surface-600'
              }`}
              title="Map view"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-400 hover:text-surface-600'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Count badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium">
            <ChefHat className="w-4 h-4" />
            {isFetching ? '...' : filteredKitchens.length} kitchens
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Loading overlay */}
          {(geoLoading || isLoading) && (
            <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              <p className="mt-3 text-sm text-surface-500">
                {geoLoading ? 'Getting your location...' : 'Finding nearby kitchens...'}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-8">
              <AlertCircle className="w-12 h-12 text-danger mb-4" />
              <h3 className="text-lg font-bold text-surface-800 mb-2">Couldn't load kitchens</h3>
              <p className="text-sm text-surface-500 text-center mb-4">
                {error?.data?.message || 'Something went wrong. Please try again.'}
              </p>
              <button
                onClick={refetch}
                className="px-5 py-2.5 gradient-primary text-white font-medium rounded-xl hover:shadow-md transition-all"
              >
                Try again
              </button>
            </div>
          )}

          {/* MAP VIEW */}
          {viewMode === 'map' && (
            <div className="flex-1 relative">
              {/* Real Google Map */}
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={mapCenter}
                    defaultZoom={DEFAULT_ZOOM}
                    mapId={MAP_ID}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    zoomControl={true}
                    streetViewControl={false}
                    mapTypeControl={false}
                    fullscreenControl={false}
                    className="w-full h-full"
                  >
                    <MapRecenter center={mapCenter} />

                    {/* User location marker */}
                    {location && (
                      <AdvancedMarker position={{ lat: location.latitude, lng: location.longitude }}>
                        <div className="relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                          <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-30" />
                        </div>
                      </AdvancedMarker>
                    )}

                    {/* Kitchen markers */}
                    {filteredKitchens.map((kitchen) => (
                      <AdvancedMarker
                        key={kitchen._id}
                        position={{
                          lat: kitchen.location.coordinates[1],
                          lng: kitchen.location.coordinates[0],
                        }}
                      >
                        <KitchenMarker
                          kitchen={kitchen}
                          isSelected={selectedKitchen?._id === kitchen._id}
                          onClick={() => handleMarkerClick(kitchen)}
                        />
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>

              {/* Kitchen preview overlay */}
              <KitchenPreview
                kitchen={selectedKitchen}
                onClose={() => setSelectedKitchen(null)}
              />

              {/* Location notice */}
              {isDefault && !geoLoading && (
                <div className="absolute top-4 left-4 right-4 sm:left-4 sm:right-auto z-20">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Showing kitchens near Delhi (default). Allow location access for accurate results.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="flex-1 overflow-y-auto bg-surface-50 p-4">
              {filteredKitchens.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <ChefHat className="w-16 h-16 text-surface-300 mb-4" />
                  <h3 className="text-lg font-bold text-surface-700 mb-2">No kitchens found</h3>
                  <p className="text-sm text-surface-500 max-w-sm">
                    {searchQuery
                      ? `No kitchens match "${searchQuery}". Try a different search.`
                      : 'No kitchens are open near your location right now. Check back later!'}
                  </p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-2">
                  {filteredKitchens.map((kitchen) => (
                    <KitchenListCard
                      key={kitchen._id}
                      kitchen={kitchen}
                      isSelected={selectedKitchen?._id === kitchen._id}
                      onClick={() => handleMarkerClick(kitchen)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

