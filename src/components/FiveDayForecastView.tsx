import React, { useState } from 'react';
import { CloudRain, ChevronDown, ChevronUp, Sunrise, Sunset, Wind, Sun } from 'lucide-react';
import { DailyItem, TemperatureUnit, WindSpeedUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { getWeatherCondition } from '../services/wmoCodes';

interface FiveDayForecastViewProps {
  daily: DailyItem[];
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const FiveDayForecastView: React.FC<FiveDayForecastViewProps> = ({
  daily,
  tempUnit,
  windUnit,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Take 5 days
  const fiveDays = daily.slice(0, 5);

  const formatTemp = (c: number): string => {
    if (tempUnit === 'fahrenheit') {
      return `${Math.round((c * 9) / 5 + 32)}°`;
    }
    return `${Math.round(c)}°`;
  };

  const formatWind = (speedKmh: number): string => {
    if (windUnit === 'mph') {
      return `${Math.round(speedKmh * 0.621371)} mph`;
    }
    return `${Math.round(speedKmh)} km/h`;
  };

  // Find week minimum and maximum to normalize the temperature range bars
  const minOfWeek = Math.min(...fiveDays.map((d) => d.tempMin));
  const maxOfWeek = Math.max(...fiveDays.map((d) => d.tempMax));
  const rangeSpan = Math.max(1, maxOfWeek - minOfWeek);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          5-Day Forecast
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">Open-Meteo High-Res</span>
      </div>

      <div className="space-y-2">
        {fiveDays.map((day, idx) => {
          const condition = getWeatherCondition(day.weatherCode, true);
          const isExpanded = expandedIndex === idx;

          // Compute left offset and width percentage for the temperature range bar
          const leftPercent = Math.max(0, Math.min(100, ((day.tempMin - minOfWeek) / rangeSpan) * 100));
          const widthPercent = Math.max(12, Math.min(100 - leftPercent, ((day.tempMax - day.tempMin) / rangeSpan) * 100));

          return (
            <div
              key={day.date}
              className="rounded-2xl bg-slate-950/40 border border-slate-800/60 overflow-hidden transition"
            >
              <div
                onClick={() => toggleExpand(idx)}
                role="button"
                tabIndex={0}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/20 active:bg-slate-800/40 transition"
              >
                {/* Day Name */}
                <div className="w-16 sm:w-20 shrink-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-200">
                    {day.dayName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(day.date + 'T12:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Condition Icon & Rain % */}
                <div className="flex items-center gap-2 w-20 shrink-0">
                  <WeatherIcon code={day.weatherCode} size={22} className="w-5.5 h-5.5 shrink-0" />
                  {day.precipitationProbability > 0 ? (
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-sky-400">
                      <CloudRain className="w-3 h-3" />
                      <span>{Math.round(day.precipitationProbability)}%</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 truncate">{condition.label}</span>
                  )}
                </div>

                {/* Temperature Range Bar */}
                <div className="flex-1 flex items-center gap-2 sm:gap-3">
                  <span className="text-xs font-mono text-slate-400 w-7 text-right">
                    {formatTemp(day.tempMin)}
                  </span>

                  <div className="flex-1 h-1.5 sm:h-2 bg-slate-800/90 rounded-full relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-100 w-7 text-left">
                    {formatTemp(day.tempMax)}
                  </span>
                </div>

                {/* Chevron */}
                <div className="text-slate-500">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expandable Daily Details Drawer */}
              {isExpanded && (
                <div className="px-4 pb-3 pt-1 border-t border-slate-800/50 bg-slate-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Sunrise</div>
                      <div className="font-mono text-slate-200">{day.sunrise}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <Sunset className="w-3.5 h-3.5 text-orange-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Sunset</div>
                      <div className="font-mono text-slate-200">{day.sunset}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Max Wind</div>
                      <div className="font-mono text-slate-200">{formatWind(day.windSpeedMax)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <div>
                      <div className="text-[10px] text-slate-400">Peak UV</div>
                      <div className="font-mono text-slate-200">{day.uvIndexMax}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
