import React from 'react';
import { Sun, CalendarDays, Map, ShieldAlert, Download } from 'lucide-react';

export type TabId = 'today' | 'forecast' | 'map' | 'alerts';

interface NavigationTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  alertCount?: number;
  isInstallable?: boolean;
  onInstall?: () => void;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activeTab,
  onTabChange,
  alertCount = 0,
  isInstallable,
  onInstall,
}) => {
  const tabs = [
    { id: 'today' as TabId, label: 'Today', icon: Sun },
    { id: 'forecast' as TabId, label: '5-Day', icon: CalendarDays },
    { id: 'map' as TabId, label: 'Radar Map', icon: Map },
    { id: 'alerts' as TabId, label: 'Alerts', icon: ShieldAlert, badge: alertCount },
  ];

  return (
    <div className="w-full bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-1 px-2 flex flex-col items-center justify-center rounded-xl transition-all duration-200 relative ${
              isActive
                ? 'text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full min-w-4 text-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-normal'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-sky-400 mt-0.5" />
            )}
          </button>
        );
      })}

      {isInstallable && onInstall && (
        <button
          onClick={onInstall}
          className="flex-1 py-1 px-2 flex flex-col items-center justify-center rounded-xl text-emerald-400 hover:text-emerald-300 transition active:scale-95"
          title="Install WTHR-GO on Android"
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Install</span>
        </button>
      )}
    </div>
  );
};
