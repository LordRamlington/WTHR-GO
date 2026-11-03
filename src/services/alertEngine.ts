import { CurrentWeather, DailyItem, SevereAlert, AirQuality } from '../types/weather';

export function evaluateSevereAlerts(
  locationName: string,
  current: CurrentWeather,
  daily: DailyItem[],
  airQuality?: AirQuality
): SevereAlert[] {
  const alerts: SevereAlert[] = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 6 * 3600 * 1000).toISOString();
  const nowIso = now.toISOString();

  // 1. Severe Thunderstorm & Hail
  if ([95, 96, 99].includes(current.weatherCode)) {
    alerts.push({
      id: `storm-${locationName}-${Math.floor(Date.now() / 3600000)}`,
      title: current.weatherCode === 99 ? 'Severe Thunderstorm & Hail Emergency' : 'Severe Thunderstorm Warning',
      severity: current.weatherCode === 99 ? 'extreme' : 'severe',
      category: 'storm',
      headline: `Active electrical storm detected near ${locationName}`,
      description: 'Dangerous lightning strikes, strong turbulent downdrafts, and localized hail reported. Potential risk to outdoor structures and power lines.',
      instruction: 'Seek shelter in a sturdy building immediately. Stay away from windows, metal fences, and open bodies of water.',
      onset: nowIso,
      expires: expiresAt,
      area: `${locationName} Metro & Surrounding Counties`,
      source: 'Global Meteorological Early Warning System',
    });
  }

  // 2. High Wind & Gale
  const highGust = (current.windGusts && current.windGusts >= 70) || current.windSpeed >= 50;
  if (highGust) {
    alerts.push({
      id: `wind-${locationName}-${Math.floor(Date.now() / 3600000)}`,
      title: current.windSpeed >= 65 ? 'High Wind / Gale Warning' : 'Wind Advisory',
      severity: current.windSpeed >= 65 ? 'severe' : 'moderate',
      category: 'wind',
      headline: `Damaging wind gusts reaching ${Math.round(current.windGusts || current.windSpeed)} km/h`,
      description: 'Sustained severe winds capable of bringing down tree branches and causing sporadic power interruptions.',
      instruction: 'Secure patio furniture, lightweight outdoor items, and trash bins. High-profile vehicles should exercise extreme caution on elevated bridges.',
      onset: nowIso,
      expires: expiresAt,
      area: locationName,
      source: 'National Weather Observation Stream',
    });
  }

  // 3. Extreme Heat or Flash Freeze
  if (current.temperature >= 35 || current.feelsLike >= 38) {
    alerts.push({
      id: `heat-${locationName}-${Math.floor(Date.now() / 3600000)}`,
      title: 'Extreme Heat & Hyperthermia Warning',
      severity: current.temperature >= 38 ? 'extreme' : 'severe',
      category: 'heat',
      headline: `Dangerous heat index of ${Math.round(current.feelsLike)}°C recorded`,
      description: 'Prolonged exposure can lead to heat exhaustion and life-threatening heat stroke.',
      instruction: 'Drink abundant water, avoid strenuous midday outdoor physical exertion, and check on elderly neighbors and pets.',
      onset: nowIso,
      expires: expiresAt,
      area: locationName,
      source: 'Climate Health Alert Network',
    });
  } else if (current.temperature <= -12) {
    alerts.push({
      id: `freeze-${locationName}-${Math.floor(Date.now() / 3600000)}`,
      title: 'Hard Freeze & Hypothermia Alert',
      severity: current.temperature <= -20 ? 'extreme' : 'severe',
      category: 'freeze',
      headline: `Sub-zero Arctic air: ${Math.round(current.temperature)}°C`,
      description: 'Exposed skin can suffer frostbite within 20 minutes under current wind chill.',
      instruction: 'Dress in layered thermal clothing, insulate exposed exterior water pipes, and bring pets indoors.',
      onset: nowIso,
      expires: expiresAt,
      area: locationName,
      source: 'Arctic Climate Monitoring Service',
    });
  }

  // 4. Excessive Precipitation / Flood Risk
  const todayDaily = daily[0];
  if ((todayDaily && todayDaily.precipitationSum >= 35) || current.precipitation >= 12) {
    alerts.push({
      id: `flood-${locationName}-${Math.floor(Date.now() / 3600000)}`,
      title: 'Flash Flood & Torrential Rain Watch',
      severity: 'severe',
      category: 'flood',
      headline: `Torrential rainfall exceeding expected drainage capacity in ${locationName}`,
      description: 'Rapid runoff may inundate low-lying roads, underpasses, and urban creeks.',
      instruction: 'Never drive through flooded roadways. Turn around, do not drown.',
      onset: nowIso,
      expires: expiresAt,
      area: `${locationName} Lowlands`,
      source: 'Hydrological Alert Service',
    });
  }

  // 5. Extreme Solar UV
  if (current.uvIndex >= 9) {
    alerts.push({
      id: `uv-${locationName}-${Math.floor(Date.now() / 3600000)}`,
      title: 'Very High Solar UV Radiation Alert',
      severity: 'moderate',
      category: 'heat',
      headline: `UV Index of ${current.uvIndex} (Very High)`,
      description: 'Unprotected skin will burn rapidly under direct noon solar exposure.',
      instruction: 'Wear broad-spectrum SPF 50+ sunscreen, UV-blocking sunglasses, and seek shade between 11 AM and 3 PM.',
      onset: nowIso,
      expires: expiresAt,
      area: locationName,
      source: 'Atmospheric Radiation Laboratory',
    });
  }

  // 6. Air Quality Hazard
  if (airQuality && airQuality.aqiUs >= 151) {
    alerts.push({
      id: `aqi-${locationName}-${Math.floor(Date.now() / 3600000)}`,
      title: 'Unhealthy Air Quality Advisory',
      severity: airQuality.aqiUs >= 201 ? 'severe' : 'moderate',
      category: 'air_quality',
      headline: `Particulate matter AQI reached ${airQuality.aqiUs} (${airQuality.status})`,
      description: 'Elevated PM2.5 concentrations may trigger respiratory distress in sensitive populations and healthy individuals during prolonged exertion.',
      instruction: 'Keep windows closed, run HEPA air filtration indoors, and wear an N95 respirator if venturing outside.',
      onset: nowIso,
      expires: expiresAt,
      area: `${locationName} Basin`,
      source: 'Global Air Monitoring System',
    });
  }

  return alerts;
}

export function generateSampleSevereAlert(locationName: string): SevereAlert {
  const now = new Date();
  const types: Array<{ title: string; severity: 'extreme' | 'severe'; category: SevereAlert['category']; headline: string; description: string; instruction: string }> = [
    {
      title: 'Severe Thunderstorm Warning',
      severity: 'severe',
      category: 'storm',
      headline: `Impending severe storm cell tracking towards ${locationName}`,
      description: 'Radar detects frequent cloud-to-ground lightning strikes, torrential rain rates >25mm/hr, and localized wind gusts up to 85 km/h.',
      instruction: 'Seek shelter in an interior room on the lowest floor. Unplug sensitive electronics.',
    },
    {
      title: 'Flash Flood Emergency',
      severity: 'extreme',
      category: 'flood',
      headline: `Life-threatening flash flooding confirmed in ${locationName}`,
      description: 'Torrential convective downpours have overwhelmed urban stormwater channels. Water rising rapidly in low-lying zones.',
      instruction: 'Move immediately to higher ground. Do not attempt to cross flooded streets or underpasses on foot or in vehicles.',
    },
    {
      title: 'Gale Force Wind Warning',
      severity: 'severe',
      category: 'wind',
      headline: `Damaging sustained winds exceeding 75 km/h across ${locationName}`,
      description: 'Strong squall front moving rapidly with gusts capable of uprooting shallow trees and downing overhead utilities.',
      instruction: 'Remain inside. Avoid parking near large older trees and scaffolding.',
    },
  ];

  const randomType = types[Math.floor(Math.random() * types.length)];
  return {
    id: `test-alert-${Date.now()}`,
    title: randomType.title,
    severity: randomType.severity,
    category: randomType.category,
    headline: randomType.headline,
    description: randomType.description,
    instruction: randomType.instruction,
    onset: now.toISOString(),
    expires: new Date(now.getTime() + 4 * 3600 * 1000).toISOString(),
    area: `${locationName} & Surrounding Districts`,
    source: 'National Climate Warning Center',
    isNew: true,
  };
}
