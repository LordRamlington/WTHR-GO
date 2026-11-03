import { AppSettings, GeoLocation, WeatherData } from '../types/weather';

const DEFAULT_SETTINGS: AppSettings = {
  tempUnit: 'celsius',
  windUnit: 'kmh',
  powerSaverMode: false,
  pushNotificationsEnabled: true,
  alertVibrate: true,
  autoRefreshIntervalMinutes: 10,
  enableRadarAnimation: true,
  hapticFeedback: true,
};

const DEFAULT_LOCATIONS: GeoLocation[] = [
  {
    id: 1,
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'United States',
    countryCode: 'US',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 2,
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'United Kingdom',
    countryCode: 'GB',
    admin1: 'England',
    timezone: 'Europe/London',
  },
  {
    id: 3,
    name: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    country: 'Japan',
    countryCode: 'JP',
    admin1: 'Tokyo',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 4,
    name: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    country: 'Australia',
    countryCode: 'AU',
    admin1: 'New South Wales',
    timezone: 'Australia/Sydney',
  },
];

export const offlineStorage = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem('auracast_settings');
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem('auracast_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  getSavedLocations(): GeoLocation[] {
    try {
      const data = localStorage.getItem('auracast_saved_locations');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_LOCATIONS;
  },

  saveLocations(locations: GeoLocation[]): void {
    try {
      localStorage.setItem('auracast_saved_locations', JSON.stringify(locations));
    } catch (e) {
      console.warn('Failed to save locations:', e);
    }
  },

  getLastSelectedLocation(): GeoLocation {
    try {
      const data = localStorage.getItem('auracast_last_location');
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return DEFAULT_LOCATIONS[0];
  },

  saveLastSelectedLocation(loc: GeoLocation): void {
    try {
      localStorage.setItem('auracast_last_location', JSON.stringify(loc));
    } catch (e) {
      console.warn('Failed to save last location:', e);
    }
  },

  getCachedWeatherData(lat: number, lon: number): WeatherData | null {
    try {
      const key = `auracast_weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed: WeatherData = JSON.parse(data);
        return {
          ...parsed,
          fromCache: true,
        };
      }
    } catch (e) {
      console.warn('Failed to read cached weather:', e);
    }
    return null;
  },

  saveWeatherData(data: WeatherData): void {
    try {
      const key = `auracast_weather_${data.location.latitude.toFixed(2)}_${data.location.longitude.toFixed(2)}`;
      localStorage.setItem(key, JSON.stringify({ ...data, fromCache: false }));
    } catch (e) {
      console.warn('Failed to write cached weather:', e);
    }
  },

  clearAllCache(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auracast_weather_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  },

  getCacheSizeEstimate(): string {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auracast_')) {
          const item = localStorage.getItem(key);
          if (item) total += item.length * 2; // UTF-16 bytes
        }
      }
      return `${(total / 1024).toFixed(1)} KB`;
    } catch {
      return 'Unknown';
    }
  },
};
