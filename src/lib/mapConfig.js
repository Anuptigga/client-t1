/**
 * Map configuration constants.
 * The Google Maps API key is read from env.
 * If not provided, we render a mock/fallback map.
 */

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || '';

export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi

export const DEFAULT_ZOOM = 13;

export const MAP_STYLES = {
  width: '100%',
  height: '100%',
};

export const isMapAvailable = () => !!GOOGLE_MAPS_API_KEY;
