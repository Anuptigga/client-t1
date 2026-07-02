import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice.js';

// Default center: Delhi, India
const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
};

const STORAGE_KEY = 'rajabhoj_last_location';

/**
 * Read cached location from sessionStorage for instant page loads.
 */
const getCachedLocation = () => {
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Only use if less than 10 minutes old
      if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
        return { latitude: parsed.latitude, longitude: parsed.longitude };
      }
    }
  } catch { /* ignore */ }
  return null;
};

const cacheLocation = (lat, lng) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      latitude: lat,
      longitude: lng,
      timestamp: Date.now(),
    }));
  } catch { /* ignore */ }
};

/**
 * Hook to get user's GPS location.
 * Strategy:
 *  1. Instantly use cached location from sessionStorage if available.
 *  2. OR use user's saved default location from Redux profile.
 *  3. Fire a FAST low-accuracy request (WiFi/IP based, resolves in <2s) if no cache.
 *  4. Then fire a HIGH-accuracy refinement in the background.
 *  5. Falls back to Delhi if both fail.
 */
export default function useGeolocation(autoFetch = true) {
  const user = useSelector(selectCurrentUser);
  const userLocation = user?.location?.coordinates ? {
    latitude: user.location.coordinates[1], // index 1 is lat
    longitude: user.location.coordinates[0], // index 0 is lng
  } : null;

  const cached = getCachedLocation() || userLocation;
  const [location, setLocation] = useState(cached);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cached); // not loading if we have cache
  const hasResolved = useRef(!!cached);

  const applyLocation = useCallback((lat, lng) => {
    setLocation({ latitude: lat, longitude: lng });
    cacheLocation(lat, lng);
    hasResolved.current = true;
    setLoading(false);
  }, []);

  const fallbackToDefault = useCallback(() => {
    if (!hasResolved.current) {
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    hasResolved.current = false;

    // Step 1: Fast, low-accuracy request (IP/WiFi, usually <2s)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyLocation(position.coords.latitude, position.coords.longitude);

        // Step 2: Refine with high-accuracy in background (GPS)
        navigator.geolocation.getCurrentPosition(
          (refined) => {
            applyLocation(refined.coords.latitude, refined.coords.longitude);
          },
          () => { /* low-accuracy was good enough, ignore */ },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      },
      (err) => {
        console.warn('Geolocation low-accuracy failed:', err.message);
        // Try high-accuracy as a second attempt
        navigator.geolocation.getCurrentPosition(
          (position) => {
            applyLocation(position.coords.latitude, position.coords.longitude);
          },
          (err2) => {
            console.warn('Geolocation high-accuracy failed:', err2.message);
            setError(err2.message);
            fallbackToDefault();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, [applyLocation, fallbackToDefault]);

  useEffect(() => {
    if (autoFetch && !cached) {
      requestLocation();
    } else if (cached) {
      setLoading(false);
    }
  }, [autoFetch, requestLocation]);

  return {
    location,
    error,
    loading,
    requestLocation,
    isDefault: location?.latitude === DEFAULT_LOCATION.latitude &&
               location?.longitude === DEFAULT_LOCATION.longitude,
  };
}
