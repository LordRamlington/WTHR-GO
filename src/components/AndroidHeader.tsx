import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Search,
  Settings,
  RefreshCw,
  MapPin,
  Leaf,
  ShieldAlert,
} from 'lucide-react';
import { GeoLocation, BatteryStatus } from '../types/weather';

interface AndroidHeaderProps {
  location: GeoLocation;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isOnline: boolean;
  batteryStatus: BatteryStatus | null;
  isPowerSaver: boolean;
  hasActiveAlerts?: boolean;
  onOpenAlerts?: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  location,
  onOpenSearch,
  onOpenSettings,
  onRefresh,
  isRefreshing,
  isOnline,
  batteryStatus,
  isPowerSaver,
  hasActiveAlerts,
  onOpenAlerts,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
      {/* Android System Status Bar */}
      <div className="h-6 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="font-semibold text-slate-300">{currentTime || '12:00'}</div>

        <div className="flex items-center gap-2">
          {isPowerSaver && (
            <span className="flex items-center gap-0.5 text-[9px] text-amber-400 font-sans font-bold bg-amber-400/10 px-1.5 rounded">
              <Leaf className="w-2.5 h-2.5" />
              ECO
            </span>
          )}

          {isOnline ? (
            <Wifi className="w-3 h-3 text-slate-400" />
          ) : (
            <div className="flex items-center gap-1 text-rose-400">
              <WifiOff className="w-3 h-3" />
              <span className="text-[9px]">OFFLINE</span>
            </div>
          )}

          {/* Battery */}
          <div className="flex items-center gap-1 text-slate-300">
            <span>{batteryStatus ? `${Math.round(batteryStatus.level * 100)}%` : '100%'}</span>
            {batteryStatus?.charging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        {/* Brand & City Selector */}
        <div className="flex items-center gap-1.5 max-w-[240px] sm:max-w-xs">
          <span className="text-[10px] font-black tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/25 px-1.5 py-1 rounded-xl shrink-0">
            WTHR-GO
          </span>
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition active:scale-98 truncate"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-100 truncate">
                {location.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {[location.admin1, location.country].filter(Boolean).join(', ')}
              </span>
            </div>
            <Search className="w-3 h-3 text-slate-500 ml-1 shrink-0" />
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {hasActiveAlerts && onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              title="Active severe alert"
              className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh forecast data"
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          <button
            onClick={onOpenSettings}
            title="App settings & battery optimizer"
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-t border-amber-500/30 px-3 py-1 flex items-center justify-center gap-1.5 text-[11px] text-amber-300">
          <WifiOff className="w-3 h-3 shrink-0" />
          <span>Offline mode active: Displaying saved local cache.</span>
        </div>
      )}
    </div>
  );
};
