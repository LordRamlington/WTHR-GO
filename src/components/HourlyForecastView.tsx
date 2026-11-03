import React from 'react';
import { CloudRain } from 'lucide-react';
import { HourlyItem, TemperatureUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastViewProps {
  hourly: HourlyItem[];
  tempUnit: TemperatureUnit;
}

export const HourlyForecastView: React.FC<HourlyForecastViewProps> = ({ hourly, tempUnit }) => {
  const formatTemp = (c: number): string => {
    if (tempUnit === 'fahrenheit') {
      return `${Math.round((c * 9) / 5 + 32)}°`;
    }
    return `${Math.round(c)}°`;
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          24-Hour Forecast
        </h3>
        <span className="text-[11px] text-slate-500">Hourly breakdown</span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
        {hourly.map((item, index) => {
          const isNow = index === 0;
          return (
            <div
              key={item.time}
              className={`flex-shrink-0 flex flex-col items-center justify-between w-16 py-3 px-1.5 rounded-2xl border transition ${
                isNow
                  ? 'bg-sky-500/10 border-sky-500/30 text-white'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className={`text-[11px] font-medium ${isNow ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                {isNow ? 'Now' : item.displayTime}
              </span>

              <div className="my-2">
                <WeatherIcon code={item.weatherCode} isDay={item.isDay} size={22} className="w-5.5 h-5.5" />
              </div>

              <span className="text-sm font-semibold font-mono text-slate-100">
                {formatTemp(item.temperature)}
              </span>

              {/* Rain Probability Pill */}
              <div className="mt-1.5 h-4 flex items-center justify-center">
                {item.precipitationProbability > 0 ? (
                  <div className="flex items-center gap-0.5 text-[9px] font-bold text-sky-400">
                    <CloudRain className="w-2.5 h-2.5" />
                    <span>{Math.round(item.precipitationProbability)}%</span>
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-600">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
