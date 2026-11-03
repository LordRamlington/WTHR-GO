import React from 'react';
import {
  Droplets,
  Wind,
  Compass,
  Sun,
  Gauge,
  CloudRain,
  Eye,
  Activity,
  Clock,
  WifiOff,
} from 'lucide-react';
import { CurrentWeather, DailyItem, AirQuality, TemperatureUnit, WindSpeedUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  current: CurrentWeather;
  todayDaily?: DailyItem;
  airQuality?: AirQuality;
  locationName: string;
  admin1?: string;
  country?: string;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  fromCache?: boolean;
  lastUpdated: number;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  current,
  todayDaily,
  airQuality,
  locationName,
  admin1,
  country,
  tempUnit,
  windUnit,
  fromCache,
  lastUpdated,
}) => {
  const formatTemp = (celsius: number): string => {
    if (tempUnit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const formatWind = (speedKmh: number): string => {
    if (windUnit === 'mph') {
      return `${Math.round(speedKmh * 0.621371)} mph`;
    }
    if (windUnit === 'ms') {
      return `${Math.round(speedKmh / 3.6)} m/s`;
    }
    return `${Math.round(speedKmh)} km/h`;
  };

  const timeAgo = () => {
    const diffSec = Math.floor((Date.now() - lastUpdated) / 1000);
    if (diffSec < 60) return 'Just now';
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const getUvLevel = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-400' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-400' };
    if (uv <= 10) return { label: 'Very High', color: 'text-rose-500' };
    return { label: 'Extreme', color: 'text-purple-400' };
  };

  const uvInfo = getUvLevel(current.uvIndex);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Primary Weather Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 p-5 sm:p-6 shadow-xl backdrop-blur-md">
        {/* Top Location & Staleness */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {locationName}
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {[admin1, country].filter(Boolean).join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {fromCache ? (
              <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                <WifiOff className="w-2.5 h-2.5" />
                Cached ({timeAgo()})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                <Clock className="w-2.5 h-2.5 text-sky-400" />
                {timeAgo()}
              </span>
            )}
          </div>
        </div>

        {/* Center Temperature & Main Icon */}
        <div className="my-5 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-start">
              <span className="text-6xl sm:text-7xl font-extralight tracking-tighter text-white">
                {formatTemp(current.temperature).replace('°', '')}
              </span>
              <span className="text-3xl sm:text-4xl font-light text-sky-400 -mt-1 ml-0.5">°</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <span>Feels like {formatTemp(current.feelsLike)}</span>
              {todayDaily && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>H: {formatTemp(todayDaily.tempMax)}</span>
                  <span>L: {formatTemp(todayDaily.tempMin)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 sm:p-4 rounded-3xl bg-slate-800/40 border border-slate-700/50 shadow-inner">
              <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={52} className="w-13 h-13" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-2 text-center max-w-[120px]">
              {current.condition.label}
            </span>
          </div>
        </div>

        {/* Air Quality pill if available */}
        {airQuality && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 text-[11px]">Air Quality:</span>
              <span className="font-semibold text-slate-200 text-[11px]">
                {airQuality.status}
              </span>
            </div>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${airQuality.color}25`, color: airQuality.color }}
            >
              AQI {airQuality.aqiUs}
            </span>
          </div>
        )}
      </div>

      {/* Atmospheric Metrics 4x2 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[11px] font-medium">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-white font-mono">{current.humidity}%</div>
            <div className="text-[10px] text-slate-400">
              {current.humidity > 70 ? 'High moisture' : current.humidity < 30 ? 'Dry air' : 'Optimal'}
            </div>
          </div>
        </div>

        {/* Wind */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[11px] font-medium">Wind</span>
            <Wind className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-white font-mono">{formatWind(current.windSpeed)}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Compass
                className="w-2.5 h-2.5 text-teal-400 transition-transform duration-500"
                style={{ transform: `rotate(${current.windDirection}deg)` }}
              />
              <span>{current.windDirection}°</span>
              {current.windGusts ? <span>• G {Math.round(current.windGusts)}</span> : null}
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[11px] font-medium">UV Index</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-white font-mono">{current.uvIndex}</div>
            <div className={`text-[10px] font-medium ${uvInfo.color}`}>
              {uvInfo.label}
            </div>
          </div>
        </div>

        {/* Barometer */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[11px] font-medium">Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-white font-mono">{current.pressure} <span className="text-xs text-slate-400 font-normal">hPa</span></div>
            <div className="text-[10px] text-slate-400">
              {current.pressure > 1013 ? 'High pressure' : 'Low pressure'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
