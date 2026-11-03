import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudHail,
  Wind,
  Snowflake,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = 'w-6 h-6',
  size,
}) => {
  // Clear sky
  if (code === 0) {
    return isDay ? (
      <Sun size={size} className={`${className} text-amber-400`} />
    ) : (
      <Moon size={size} className={`${className} text-sky-200`} />
    );
  }

  // Mainly clear / partly cloudy
  if (code === 1 || code === 2) {
    return isDay ? (
      <CloudSun size={size} className={`${className} text-amber-300`} />
    ) : (
      <CloudMoon size={size} className={`${className} text-sky-300`} />
    );
  }

  // Overcast
  if (code === 3) {
    return <Cloud size={size} className={`${className} text-slate-300`} />;
  }

  // Fog
  if (code === 45 || code === 48) {
    return <CloudFog size={size} className={`${className} text-slate-400`} />;
  }

  // Drizzle
  if (code >= 51 && code <= 57) {
    return <CloudDrizzle size={size} className={`${className} text-sky-400`} />;
  }

  // Rain
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return <CloudRain size={size} className={`${className} text-sky-400`} />;
  }

  // Freezing rain / hail
  if (code === 66 || code === 67) {
    return <CloudHail size={size} className={`${className} text-cyan-300`} />;
  }

  // Snow
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <Snowflake size={size} className={`${className} text-blue-200`} />;
  }

  // Thunderstorm
  if (code >= 95) {
    return <CloudLightning size={size} className={`${className} text-amber-400`} />;
  }

  return <Cloud size={size} className={`${className} text-slate-300`} />;
};
