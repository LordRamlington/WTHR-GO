export interface WeatherCondition {
  code: number;
  label: string;
  icon: string;
  description: string;
  isDay?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  uvIndex: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  cloudCover: number;
  condition: WeatherCondition;
  timestamp: string;
  dewPoint?: number;
  visibility?: number;
}

export interface HourlyItem {
  time: string;
  displayTime: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  isDay: boolean;
}

export interface DailyItem {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQuality {
  aqiUs: number;
  aqiEu: number;
  pm25: number;
  pm10: number;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
}

export interface SevereAlert {
  id: string;
  title: string;
  severity: 'extreme' | 'severe' | 'moderate' | 'advisory';
  category: 'storm' | 'wind' | 'rain' | 'flood' | 'heat' | 'freeze' | 'air_quality';
  headline: string;
  description: string;
  instruction: string;
  onset: string;
  expires: string;
  area: string;
  source: string;
  isNew?: boolean;
}

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode?: string;
  admin1?: string;
  timezone: string;
  isCurrent?: boolean;
}

export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeather;
  hourly: HourlyItem[];
  daily: DailyItem[];
  airQuality?: AirQuality;
  alerts: SevereAlert[];
  lastUpdated: number;
  fromCache?: boolean;
}

export interface BatteryStatus {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';

export interface AppSettings {
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  powerSaverMode: boolean;
  pushNotificationsEnabled: boolean;
  alertVibrate: boolean;
  autoRefreshIntervalMinutes: number; // e.g. 5 mins normal, 30 mins power saver
  enableRadarAnimation: boolean;
  hapticFeedback: boolean;
}
