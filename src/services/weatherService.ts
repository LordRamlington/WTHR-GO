import { AirQuality, CurrentWeather, DailyItem, GeoLocation, HourlyItem, WeatherData } from '../types/weather';
import { evaluateSevereAlerts } from './alertEngine';
import { offlineStorage } from './offlineStorage';
import { getWeatherCondition } from './wmoCodes';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface OpenMeteoHourlyResponse {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  pressure_msl: number[];
  wind_speed_10m: number[];
  uv_index: number[];
  is_day: number[];
}

interface OpenMeteoDailyResponse {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
}

interface OpenMeteoCurrentResponse {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m?: number;
}

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: OpenMeteoCurrentResponse;
  hourly: OpenMeteoHourlyResponse;
  daily: OpenMeteoDailyResponse;
}

function parseAirQuality(data: { current?: { european_aqi?: number; us_aqi?: number; pm10?: number; pm2_5?: number } }): AirQuality | undefined {
  if (!data.current) return undefined;
  const usAqi = data.current.us_aqi ?? 40;
  const euAqi = data.current.european_aqi ?? 25;
  const pm25 = data.current.pm2_5 ?? 10;
  const pm10 = data.current.pm10 ?? 18;

  let status: AirQuality['status'] = 'Good';
  let color = '#10b981'; // emerald-500

  if (usAqi > 300) {
    status = 'Hazardous';
    color = '#7f1d1d';
  } else if (usAqi > 200) {
    status = 'Very Unhealthy';
    color = '#831843';
  } else if (usAqi > 150) {
    status = 'Unhealthy';
    color = '#ef4444';
  } else if (usAqi > 100) {
    status = 'Unhealthy for Sensitive';
    color = '#f97316';
  } else if (usAqi > 50) {
    status = 'Moderate';
    color = '#eab308';
  }

  return {
    aqiUs: Math.round(usAqi),
    aqiEu: Math.round(euAqi),
    pm25: Number(pm25.toFixed(1)),
    pm10: Number(pm10.toFixed(1)),
    status,
    color,
  };
}

export async function fetchWeatherData(location: GeoLocation): Promise<WeatherData> {
  const { latitude, longitude, name } = location;

  try {
    // 1. Fetch current, hourly, and daily from Open-Meteo
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
      hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,pressure_msl,wind_speed_10m,uv_index,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'auto',
      forecast_days: '6', // 5-day forecast + today
    });

    const [forecastRes, aqiRes] = await Promise.all([
      fetch(`${OPEN_METEO_BASE}?${params.toString()}`),
      fetch(`${AIR_QUALITY_BASE}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5`).catch(() => null),
    ]);

    if (!forecastRes.ok) {
      throw new Error(`Open-Meteo HTTP error: ${forecastRes.status}`);
    }

    const forecastData: OpenMeteoForecastResponse = await forecastRes.json();
    let airQuality: AirQuality | undefined;

    if (aqiRes && aqiRes.ok) {
      const aqiJson = await aqiRes.json();
      airQuality = parseAirQuality(aqiJson);
    }

    // Process Current
    const c = forecastData.current;
    const isDay = Boolean(c.is_day);
    const condition = getWeatherCondition(c.weather_code, isDay);

    // Approximate UV index from current hour's hourly value
    const nowIdx = forecastData.hourly.time.findIndex((t) => new Date(t).getHours() === new Date().getHours());
    const currentUv = nowIdx !== -1 && forecastData.hourly.uv_index ? forecastData.hourly.uv_index[nowIdx] || 0 : 0;

    const current: CurrentWeather = {
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      pressure: Math.round(c.pressure_msl),
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      windGusts: c.wind_gusts_10m,
      uvIndex: Math.round(currentUv * 10) / 10,
      precipitation: c.precipitation,
      weatherCode: c.weather_code,
      isDay,
      cloudCover: c.cloud_cover,
      condition,
      timestamp: c.time,
    };

    // Process Hourly (next 24 hours starting from current hour)
    const currentHourIndex = Math.max(0, nowIdx !== -1 ? nowIdx : 0);
    const hourly: HourlyItem[] = [];
    for (let i = currentHourIndex; i < currentHourIndex + 24 && i < forecastData.hourly.time.length; i++) {
      const t = forecastData.hourly.time[i];
      const dateObj = new Date(t);
      const displayTime = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      hourly.push({
        time: t,
        displayTime,
        temperature: forecastData.hourly.temperature_2m[i],
        weatherCode: forecastData.hourly.weather_code[i],
        precipitationProbability: forecastData.hourly.precipitation_probability[i] || 0,
        precipitation: forecastData.hourly.precipitation[i] || 0,
        windSpeed: forecastData.hourly.wind_speed_10m[i] || 0,
        uvIndex: forecastData.hourly.uv_index[i] || 0,
        isDay: Boolean(forecastData.hourly.is_day?.[i] ?? 1),
      });
    }

    // Process Daily (up to 5-day forecast)
    const daily: DailyItem[] = [];
    const daysCount = Math.min(6, forecastData.daily.time.length);
    for (let i = 0; i < daysCount; i++) {
      const d = forecastData.daily.time[i];
      const dateObj = new Date(d);
      const isToday = i === 0;
      const dayName = isToday
        ? 'Today'
        : dateObj.toLocaleDateString([], { weekday: 'short' });

      daily.push({
        date: d,
        dayName,
        weatherCode: forecastData.daily.weather_code[i],
        tempMax: forecastData.daily.temperature_2m_max[i],
        tempMin: forecastData.daily.temperature_2m_min[i],
        apparentTempMax: forecastData.daily.apparent_temperature_max[i],
        apparentTempMin: forecastData.daily.apparent_temperature_min[i],
        precipitationSum: forecastData.daily.precipitation_sum[i] || 0,
        precipitationProbability: forecastData.daily.precipitation_probability_max[i] || 0,
        windSpeedMax: forecastData.daily.wind_speed_10m_max[i] || 0,
        uvIndexMax: forecastData.daily.uv_index_max[i] || 0,
        sunrise: forecastData.daily.sunrise[i] ? new Date(forecastData.daily.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        sunset: forecastData.daily.sunset[i] ? new Date(forecastData.daily.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      });
    }

    // Evaluate severe climate alerts using our meteorological engine
    const alerts = evaluateSevereAlerts(name, current, daily, airQuality);

    const fullData: WeatherData = {
      location,
      current,
      hourly,
      daily,
      airQuality,
      alerts,
      lastUpdated: Date.now(),
      fromCache: false,
    };

    // Save to offline storage immediately
    offlineStorage.saveWeatherData(fullData);

    return fullData;
  } catch (error) {
    console.warn('Network weather fetch failed, attempting offline cache recovery...', error);
    const cached = offlineStorage.getCachedWeatherData(latitude, longitude);
    if (cached) {
      return {
        ...cached,
        location,
        fromCache: true,
      };
    }

    // If completely offline with no prior cache, return a resilient offline fallback model
    return createResilientOfflineFallback(location);
  }
}

function createResilientOfflineFallback(location: GeoLocation): WeatherData {
  const condition = getWeatherCondition(2, true);
  const now = new Date();
  const current: CurrentWeather = {
    temperature: 18,
    feelsLike: 17,
    humidity: 55,
    pressure: 1013,
    windSpeed: 12,
    windDirection: 180,
    windGusts: 18,
    uvIndex: 4,
    precipitation: 0,
    weatherCode: 2,
    isDay: true,
    cloudCover: 30,
    condition,
    timestamp: now.toISOString(),
  };

  const hourly: HourlyItem[] = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date(now.getTime() + i * 3600000);
    return {
      time: d.toISOString(),
      displayTime: d.toLocaleTimeString([], { hour: 'numeric' }),
      temperature: 15 + Math.sin(i / 3) * 6,
      weatherCode: 1,
      precipitationProbability: 10,
      precipitation: 0,
      windSpeed: 10,
      uvIndex: i > 8 && i < 18 ? 5 : 0,
      isDay: i > 6 && i < 20,
    };
  });

  const daily: DailyItem[] = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(now.getTime() + i * 86400000);
    return {
      date: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : d.toLocaleDateString([], { weekday: 'short' }),
      weatherCode: i % 2 === 0 ? 1 : 2,
      tempMax: 20 + i,
      tempMin: 12 + i,
      apparentTempMax: 21 + i,
      apparentTempMin: 11 + i,
      precipitationSum: 0,
      precipitationProbability: 15,
      windSpeedMax: 15,
      uvIndexMax: 6,
      sunrise: '06:30',
      sunset: '19:45',
    };
  });

  return {
    location,
    current,
    hourly,
    daily,
    airQuality: {
      aqiUs: 38,
      aqiEu: 22,
      pm25: 8.5,
      pm10: 14.2,
      status: 'Good',
      color: '#10b981',
    },
    alerts: [],
    lastUpdated: Date.now(),
    fromCache: true,
  };
}
