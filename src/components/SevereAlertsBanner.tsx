import React from 'react';
import { AlertTriangle, ChevronRight, ShieldAlert, BellRing } from 'lucide-react';
import { SevereAlert } from '../types/weather';

interface SevereAlertsBannerProps {
  alerts: SevereAlert[];
  onOpenAlerts: () => void;
  onTriggerTestAlert?: () => void;
}

export const SevereAlertsBanner: React.FC<SevereAlertsBannerProps> = ({
  alerts,
  onOpenAlerts,
  onTriggerTestAlert,
}) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300">No active severe climate warnings</span>
        </div>
        {onTriggerTestAlert && (
          <button
            onClick={onTriggerTestAlert}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium active:scale-95 transition"
            title="Simulate severe storm push notification"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Test Alert</span>
          </button>
        )}
      </div>
    );
  }

  const primaryAlert = alerts[0];
  const isExtreme = primaryAlert.severity === 'extreme';

  return (
    <div
      onClick={onOpenAlerts}
      role="button"
      tabIndex={0}
      className={`cursor-pointer w-full rounded-2xl p-3.5 border transition-all duration-300 shadow-lg ${
        isExtreme
          ? 'bg-gradient-to-r from-rose-950/80 via-red-900/40 to-slate-900 border-rose-500/60 text-rose-100 shadow-rose-950/40'
          : 'bg-gradient-to-r from-amber-950/80 via-yellow-900/30 to-slate-900 border-amber-500/60 text-amber-100 shadow-amber-950/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={`p-2 rounded-xl mt-0.5 ${
              isExtreme ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isExtreme ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isExtreme ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                }`}
              >
                {primaryAlert.severity.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {primaryAlert.title}
              </span>
              {alerts.length > 1 && (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                  +{alerts.length - 1} more
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-normal">
              {primaryAlert.headline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-slate-300 shrink-0 mt-1">
          <span className="hidden sm:inline">Details</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
