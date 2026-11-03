import React from 'react';
import {
  X,
  Battery,
  BatteryCharging,
  Bell,
  Thermometer,
  Wind,
  HardDrive,
  Trash2,
  Info,
  Shield,
  Smartphone,
  Check,
} from 'lucide-react';
import { AppSettings, BatteryStatus } from '../types/weather';
import { offlineStorage } from '../services/offlineStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  batteryStatus: BatteryStatus | null;
  onClearCache: () => void;
  cacheSize: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  batteryStatus,
  onClearCache,
  cacheSize,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400" />
            <span>App Settings & Performance</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Battery Saver Mode Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    settings.powerSaverMode
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {batteryStatus?.charging ? (
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Battery className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Eco Battery Saver
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {batteryStatus
                      ? `Device battery: ${Math.round(batteryStatus.level * 100)}% ${
                          batteryStatus.charging ? '(Charging)' : ''
                        }`
                      : 'Preserve battery on mobile'}
                  </div>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.powerSaverMode}
                onClick={() => onUpdateSettings({ powerSaverMode: !settings.powerSaverMode })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.powerSaverMode ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.powerSaverMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
              When active, reduces background polling intervals from 10 to 30 minutes, stops radar frame cycling loops, and optimizes screen updates to maximize Android battery endurance.
            </p>
          </div>

          {/* Temperature Units */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Thermometer className="w-3.5 h-3.5 text-sky-400" />
              <span>Temperature Unit</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ tempUnit: 'celsius' })}
                className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.tempUnit === 'celsius'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {settings.tempUnit === 'celsius' && <Check className="w-3.5 h-3.5" />}
                <span>Celsius (°C)</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ tempUnit: 'fahrenheit' })}
                className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.tempUnit === 'fahrenheit'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {settings.tempUnit === 'fahrenheit' && <Check className="w-3.5 h-3.5" />}
                <span>Fahrenheit (°F)</span>
              </button>
            </div>
          </div>

          {/* Wind Speed Units */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Wind Speed Unit</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['kmh', 'mph', 'ms'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => onUpdateSettings({ windUnit: unit })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1 transition ${
                    settings.windUnit === unit
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {settings.windUnit === unit && <Check className="w-3 h-3" />}
                  <span>{unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'm/s'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Offline Cache Storage */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Offline Cache</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{cacheSize}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Snapshots of 5-day forecasts and radar tile metadata are cached locally to provide zero-latency instant offline opening without mobile network connectivity.
            </p>

            <button
              onClick={onClearCache}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 text-xs font-medium border border-slate-800 hover:border-rose-500/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cached Weather Data</span>
            </button>
          </div>

          {/* Free Data Sources & Credits */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span>100% Free Public Data (Zero API Key Required):</span>
            </div>
            <div>• <strong className="text-slate-200">Open-Meteo API</strong>: Real-time ECMWF/NOAA high-resolution forecasts & air quality (Free, No Key)</div>
            <div>• <strong className="text-slate-200">RainViewer</strong>: Global live precipitation Doppler radar feed (Free, No Key)</div>
            <div>• <strong className="text-slate-200">OpenStreetMap & Esri</strong>: Community world basemaps & satellite layers (Free, No Key)</div>
            <div>• <strong className="text-slate-200">Google AdMob</strong>: Standard 320x50 smart banner placeholder</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-sky-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
