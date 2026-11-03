import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GeoLocation,
  WeatherData,
  AppSettings,
  BatteryStatus,
  SevereAlert,
} from './types/weather';
import { fetchWeatherData } from './services/weatherService';
import { offlineStorage } from './services/offlineStorage';
import { batteryOptimizer } from './services/batteryOptimizer';
import { pushNotificationService } from './services/pushNotificationService';
import { generateSampleSevereAlert } from './services/alertEngine';
import { AndroidHeader } from './components/AndroidHeader';
import { NavigationTabBar, TabId } from './components/NavigationTabBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecastView } from './components/HourlyForecastView';
import { FiveDayForecastView } from './components/FiveDayForecastView';
import { InteractiveWeatherMap } from './components/InteractiveWeatherMap';
import { SevereAlertsBanner } from './components/SevereAlertsBanner';
import { SevereAlertsModal } from './components/SevereAlertsModal';
import { LocationSearchModal } from './components/LocationSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { AdMobBanner } from './components/AdMobBanner';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Smartphone, Monitor, CloudSun, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Settings & Storage State
  const [settings, setSettings] = useState<AppSettings>(() => offlineStorage.getSettings());
  const [savedLocations, setSavedLocations] = useState<GeoLocation[]>(() => offlineStorage.getSavedLocations());
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(() => offlineStorage.getLastSelectedLocation());

  // Weather Data & Fetching State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(() =>
    offlineStorage.getCachedWeatherData(currentLocation.latitude, currentLocation.longitude)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!weatherData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Device & Offline State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);
  const [cacheSize, setCacheSize] = useState<string>('0 KB');

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'phone' | 'wide'>('phone');

  // PWA Install hook
  const { isInstallable, install } = usePWAInstall();

  // Load weather data
  const loadWeather = useCallback(async (loc: GeoLocation, showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else if (!weatherData) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
      setCacheSize(offlineStorage.getCacheSizeEstimate());

      // If new severe alerts exist, dispatch notification
      if (data.alerts.length > 0 && settings.pushNotificationsEnabled) {
        data.alerts.forEach((alert) => {
          pushNotificationService.sendSevereAlertNotification(alert, {
            vibrate: settings.alertVibrate,
            sound: true,
          });
        });
      }
    } catch (err) {
      console.warn('Weather fetch failed:', err);
      setErrorMessage('Unable to reach meteorological servers. Using offline cached forecast.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [weatherData, settings.pushNotificationsEnabled, settings.alertVibrate]);

  // Initial load & Location switch
  useEffect(() => {
    loadWeather(currentLocation);
    offlineStorage.saveLastSelectedLocation(currentLocation);
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Network online/offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadWeather(currentLocation, true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentLocation, loadWeather]);

  // Battery Status Listener & Eco Mode
  useEffect(() => {
    const unsubscribe = batteryOptimizer.onBatteryChange((status) => {
      setBatteryStatus(status);
      if (batteryOptimizer.shouldSuggestPowerSaver() && !settings.powerSaverMode) {
        setSettings((prev) => {
          const updated = { ...prev, powerSaverMode: true };
          offlineStorage.saveSettings(updated);
          return updated;
        });
      }
    });

    setCacheSize(offlineStorage.getCacheSizeEstimate());
    return () => unsubscribe();
  }, [settings.powerSaverMode]);

  // Automatic Refresh Interval (Respects battery saver)
  useEffect(() => {
    const minutes = settings.powerSaverMode ? 30 : 10;
    const intervalMs = minutes * 60 * 1000;

    const timer = setInterval(() => {
      if (!document.hidden && navigator.onLine) {
        loadWeather(currentLocation, true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentLocation, settings.powerSaverMode, loadWeather]);

  // Handle Settings updates
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    offlineStorage.saveSettings(updated);
  };

  // Toggle saved favorite locations
  const handleToggleSaveLocation = (loc: GeoLocation) => {
    setSavedLocations((prev) => {
      const exists = prev.some((l) => Math.abs(l.latitude - loc.latitude) < 0.05 && Math.abs(l.longitude - loc.longitude) < 0.05);
      const next = exists
        ? prev.filter((l) => !(Math.abs(l.latitude - loc.latitude) < 0.05 && Math.abs(l.longitude - loc.longitude) < 0.05))
        : [...prev, loc];
      offlineStorage.saveLocations(next);
      return next;
    });
  };

  // Clear cache handler
  const handleClearCache = () => {
    offlineStorage.clearAllCache();
    setCacheSize(offlineStorage.getCacheSizeEstimate());
    if (weatherData) {
      offlineStorage.saveWeatherData(weatherData);
    }
  };

  // Trigger test severe storm alert (tests notifications, sound, haptic vibration)
  const handleTriggerTestAlert = () => {
    const sample = generateSampleSevereAlert(currentLocation.name);
    setWeatherData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        alerts: [sample, ...prev.alerts.filter((a) => a.id !== sample.id)],
      };
    });

    // Send push notification
    pushNotificationService.sendSevereAlertNotification(sample, {
      vibrate: settings.alertVibrate,
      sound: true,
    });

    setIsAlertsModalOpen(true);
  };

  // Toggle push notification permission
  const handleToggleNotifications = async () => {
    const granted = await pushNotificationService.requestPermission();
    if (granted) {
      handleUpdateSettings({ pushNotificationsEnabled: true });
      pushNotificationService.playAlertSound();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start select-none">
      {/* Desktop Device Viewport Frame Switcher */}
      <div className="w-full max-w-5xl py-2 px-4 hidden md:flex items-center justify-between text-xs text-slate-400 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-300">WTHR-GO</span>
          <span className="text-[11px] text-slate-500">Android Progressive Web App</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('phone')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
              viewMode === 'phone' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Phone View</span>
          </button>
          <button
            onClick={() => setViewMode('wide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
              viewMode === 'wide' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Responsive Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Container: Android Phone Shell or Wide Shell */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          viewMode === 'phone'
            ? 'max-w-[420px] my-0 md:my-4 rounded-none md:rounded-[44px] shadow-2xl border-0 md:border-[10px] md:border-slate-800 overflow-hidden ring-1 ring-slate-700/50 min-h-screen md:min-h-[860px]'
            : 'max-w-4xl my-2 px-2'
        } bg-slate-950 relative`}
      >
        {/* Android Punch Hole Camera Accent (on phone preview) */}
        {viewMode === 'phone' && (
          <div className="hidden md:flex justify-center items-center h-4 w-full bg-slate-950 relative z-40">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner" />
          </div>
        )}

        {/* Android Header with Status Bar & City Navigation */}
        <AndroidHeader
          location={currentLocation}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRefresh={() => loadWeather(currentLocation, true)}
          isRefreshing={isRefreshing}
          isOnline={isOnline}
          batteryStatus={batteryStatus}
          isPowerSaver={settings.powerSaverMode}
          hasActiveAlerts={Boolean(weatherData && weatherData.alerts.length > 0)}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
        />

        {/* In-App PWA Install Banner */}
        <PWAInstallBanner />

        {/* Scrollable Main Body Content */}
        <main className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Severe Climate Alert Banner */}
          {weatherData && (
            <SevereAlertsBanner
              alerts={weatherData.alerts}
              onOpenAlerts={() => setIsAlertsModalOpen(true)}
              onTriggerTestAlert={handleTriggerTestAlert}
            />
          )}

          {/* Loading Skeleton */}
          {isLoading && !weatherData && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">
                Fetching real-time atmospheric data from Open-Meteo...
              </p>
            </div>
          )}

          {/* TAB 1: TODAY OVERVIEW */}
          {activeTab === 'today' && weatherData && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <CurrentWeatherCard
                current={weatherData.current}
                todayDaily={weatherData.daily[0]}
                airQuality={weatherData.airQuality}
                locationName={weatherData.location.name}
                admin1={weatherData.location.admin1}
                country={weatherData.location.country}
                tempUnit={settings.tempUnit}
                windUnit={settings.windUnit}
                fromCache={weatherData.fromCache}
                lastUpdated={weatherData.lastUpdated}
              />

              <HourlyForecastView
                hourly={weatherData.hourly}
                tempUnit={settings.tempUnit}
              />

              <FiveDayForecastView
                daily={weatherData.daily}
                tempUnit={settings.tempUnit}
                windUnit={settings.windUnit}
              />
            </div>
          )}

          {/* TAB 2: 5-DAY FORECAST */}
          {activeTab === 'forecast' && weatherData && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <FiveDayForecastView
                daily={weatherData.daily}
                tempUnit={settings.tempUnit}
                windUnit={settings.windUnit}
              />

              <HourlyForecastView
                hourly={weatherData.hourly}
                tempUnit={settings.tempUnit}
              />
            </div>
          )}

          {/* TAB 3: INTERACTIVE RADAR MAP */}
          {activeTab === 'map' && (
            <div className="h-[460px] sm:h-[520px] flex flex-col animate-in fade-in duration-200">
              <InteractiveWeatherMap
                location={currentLocation}
                currentTemp={weatherData?.current.temperature}
                conditionLabel={weatherData?.current.condition.label}
                isPowerSaver={settings.powerSaverMode}
                onSelectCoordinates={(lat, lon) => {
                  setCurrentLocation({
                    id: Date.now(),
                    name: `Map Pin (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
                    latitude: lat,
                    longitude: lon,
                    country: '',
                    timezone: 'auto',
                  });
                }}
              />
            </div>
          )}

          {/* TAB 4: SEVERE CLIMATE ALERTS */}
          {activeTab === 'alerts' && weatherData && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Severe Climate Center</h3>
                  <button
                    onClick={handleTriggerTestAlert}
                    className="text-xs text-sky-400 font-semibold px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 active:scale-95 transition"
                  >
                    Simulate Warning
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitors real-time thunderstorm cells, hurricane/gale gusts, torrential flash flood downpours, extreme heat index, and frost hazards.
                </p>
              </div>

              <SevereAlertsBanner
                alerts={weatherData.alerts}
                onOpenAlerts={() => setIsAlertsModalOpen(true)}
                onTriggerTestAlert={handleTriggerTestAlert}
              />

              <div className="space-y-2">
                {weatherData.alerts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
                    No active meteorological warnings in this zone. Tap "Simulate Warning" above to verify push notifications.
                  </div>
                ) : (
                  weatherData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{alert.title}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{alert.description}</p>
                      <div className="text-[11px] text-amber-300 font-medium bg-slate-950 p-2 rounded-xl border border-slate-800">
                        {alert.instruction}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* Permanent AdMob Banner (Required by user brief) */}
        <AdMobBanner />

        {/* Bottom Android Navigation Tab Bar */}
        <NavigationTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={weatherData?.alerts.length || 0}
          isInstallable={isInstallable}
          onInstall={install}
        />
      </div>

      {/* Modals & Dialogs */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          setActiveTab('today');
        }}
        savedLocations={savedLocations}
        onToggleSaveLocation={handleToggleSaveLocation}
        currentSelectedId={currentLocation.id}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        batteryStatus={batteryStatus}
        onClearCache={handleClearCache}
        cacheSize={cacheSize}
      />

      {weatherData && (
        <SevereAlertsModal
          alerts={weatherData.alerts}
          isOpen={isAlertsModalOpen}
          onClose={() => setIsAlertsModalOpen(false)}
          onTriggerTestAlert={handleTriggerTestAlert}
          notificationsEnabled={settings.pushNotificationsEnabled}
          onToggleNotifications={handleToggleNotifications}
        />
      )}
    </div>
  );
}
