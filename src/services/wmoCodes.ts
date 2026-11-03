import { WeatherCondition } from '../types/weather';

export function getWeatherCondition(code: number, isDay = true): WeatherCondition {
  switch (code) {
    case 0:
      return {
        code,
        label: isDay ? 'Clear Sky' : 'Clear Night',
        icon: isDay ? 'Sun' : 'Moon',
        description: isDay ? 'Bright and sunny conditions' : 'Clear skies tonight',
        isDay,
      };
    case 1:
      return {
        code,
        label: isDay ? 'Mainly Clear' : 'Partly Clear',
        icon: isDay ? 'Sun' : 'Moon',
        description: 'Mostly clear skies with fleeting light clouds',
        isDay,
      };
    case 2:
      return {
        code,
        label: 'Partly Cloudy',
        icon: 'CloudSun',
        description: 'Scattered clouds with periodic sunny intervals',
        isDay,
      };
    case 3:
      return {
        code,
        label: 'Overcast',
        icon: 'Cloud',
        description: 'Complete cloud blanket covering the sky',
        isDay,
      };
    case 45:
      return {
        code,
        label: 'Foggy',
        icon: 'CloudFog',
        description: 'Dense fog reducing visibility on roads',
        isDay,
      };
    case 48:
      return {
        code,
        label: 'Depositing Rime Fog',
        icon: 'CloudFog',
        description: 'Freezing fog forming frost crystals on surfaces',
        isDay,
      };
    case 51:
      return {
        code,
        label: 'Light Drizzle',
        icon: 'CloudDrizzle',
        description: 'Fine, gentle drizzle throughout the area',
        isDay,
      };
    case 53:
      return {
        code,
        label: 'Moderate Drizzle',
        icon: 'CloudDrizzle',
        description: 'Steady mist and persistent light drizzle',
        isDay,
      };
    case 55:
      return {
        code,
        label: 'Dense Drizzle',
        icon: 'CloudDrizzle',
        description: 'Heavy drizzle with reduced ambient visibility',
        isDay,
      };
    case 56:
    case 57:
      return {
        code,
        label: 'Freezing Drizzle',
        icon: 'CloudHail',
        description: 'Freezing mist causing slippery roadway conditions',
        isDay,
      };
    case 61:
      return {
        code,
        label: 'Slight Rain',
        icon: 'CloudRain',
        description: 'Occasional light raindrops and damp air',
        isDay,
      };
    case 63:
      return {
        code,
        label: 'Moderate Rain',
        icon: 'CloudRain',
        description: 'Consistent rain shower, carry an umbrella',
        isDay,
      };
    case 65:
      return {
        code,
        label: 'Heavy Rain',
        icon: 'CloudRain',
        description: 'Torrential downpour with potential localized pooling',
        isDay,
      };
    case 66:
    case 67:
      return {
        code,
        label: 'Freezing Rain',
        icon: 'CloudHail',
        description: 'Hazardous black ice alert on road surfaces',
        isDay,
      };
    case 71:
      return {
        code,
        label: 'Slight Snow',
        icon: 'CloudSnow',
        description: 'Gentle fluttering snowflakes drifting down',
        isDay,
      };
    case 73:
      return {
        code,
        label: 'Moderate Snow',
        icon: 'CloudSnow',
        description: 'Steady accumulating snowfall across roads',
        isDay,
      };
    case 75:
      return {
        code,
        label: 'Heavy Snowfall',
        icon: 'Snowflake',
        description: 'Blizzard-like conditions with heavy accumulation',
        isDay,
      };
    case 77:
      return {
        code,
        label: 'Snow Grains',
        icon: 'CloudSnow',
        description: 'Crisp opaque ice particles falling intermittently',
        isDay,
      };
    case 80:
      return {
        code,
        label: 'Light Showers',
        icon: 'CloudRain',
        description: 'Passing brief rain showers',
        isDay,
      };
    case 81:
      return {
        code,
        label: 'Passing Rain Showers',
        icon: 'CloudRain',
        description: 'Short bursts of moderate to heavy rainfall',
        isDay,
      };
    case 82:
      return {
        code,
        label: 'Violent Showers',
        icon: 'CloudRain',
        description: 'Sudden intense deluge of rain with gusty winds',
        isDay,
      };
    case 85:
    case 86:
      return {
        code,
        label: 'Snow Showers',
        icon: 'CloudSnow',
        description: 'Intermittent rapid flurry showers',
        isDay,
      };
    case 95:
      return {
        code,
        label: 'Thunderstorm',
        icon: 'CloudLightning',
        description: 'Active lightning strikes and rumbling thunder',
        isDay,
      };
    case 96:
      return {
        code,
        label: 'Thunderstorm & Hail',
        icon: 'CloudLightning',
        description: 'Severe electrical storm with light hail stones',
        isDay,
      };
    case 99:
      return {
        code,
        label: 'Heavy Severe Storm',
        icon: 'CloudLightning',
        description: 'Dangerous storm with destructive hail and high winds',
        isDay,
      };
    default:
      return {
        code,
        label: 'Partly Cloudy',
        icon: 'Cloud',
        description: 'Variable cloud cover throughout the day',
        isDay,
      };
  }
}
