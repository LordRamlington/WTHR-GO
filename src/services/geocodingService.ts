import { GeoLocation } from '../types/weather';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

interface OpenMeteoGeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

const FALLBACK_POPULAR_CITIES: GeoLocation[] = [
  { id: 101, name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'United States', countryCode: 'US', admin1: 'New York', timezone: 'America/New_York' },
  { id: 102, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', countryCode: 'GB', admin1: 'England', timezone: 'Europe/London' },
  { id: 103, name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', countryCode: 'JP', admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 104, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', countryCode: 'FR', admin1: 'Île-de-France', timezone: 'Europe/Paris' },
  { id: 105, name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', countryCode: 'AU', admin1: 'New South Wales', timezone: 'Australia/Sydney' },
  { id: 106, name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, country: 'United States', countryCode: 'US', admin1: 'California', timezone: 'America/Los_Angeles' },
  { id: 107, name: 'Berlin', latitude: 52.52, longitude: 13.405, country: 'Germany', countryCode: 'DE', admin1: 'Berlin', timezone: 'Europe/Berlin' },
  { id: 108, name: 'Toronto', latitude: 43.6532, longitude: -79.3832, country: 'Canada', countryCode: 'CA', admin1: 'Ontario', timezone: 'America/Toronto' },
];

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const res = await fetch(`${GEOCODING_BASE}?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`);
    if (!res.ok) throw new Error('Geocoding request failed');
    const data: { results?: OpenMeteoGeoResult[] } = await res.json();
    if (!data.results || data.results.length === 0) return [];

    return data.results.map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country || '',
      countryCode: r.country_code || '',
      admin1: r.admin1,
      timezone: r.timezone || 'auto',
    }));
  } catch (err) {
    console.warn('Geocoding search failed, searching offline popular cities:', err);
    return FALLBACK_POPULAR_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        (c.admin1 && c.admin1.toLowerCase().includes(trimmed.toLowerCase())) ||
        c.country.toLowerCase().includes(trimmed.toLowerCase())
    );
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeoLocation> {
  try {
    // OpenStreetMap Nominatim reverse geocode (free, public rate-limited friendly)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || 'Current Location';
      return {
        id: Date.now(),
        name: cityName,
        latitude,
        longitude,
        country: addr.country || '',
        countryCode: addr.country_code ? addr.country_code.toUpperCase() : '',
        admin1: addr.state || addr.region,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
        isCurrent: true,
      };
    }
  } catch {
    // Fallback if network or CORS fails
  }

  return {
    id: Date.now(),
    name: 'Current Location',
    latitude,
    longitude,
    country: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
    isCurrent: true,
  };
}
