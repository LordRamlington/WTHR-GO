import React from 'react';
import { X, AlertTriangle, ShieldCheck, Bell, BellRing, Volume2, Smartphone, ExternalLink } from 'lucide-react';
import { SevereAlert } from '../types/weather';
import { pushNotificationService } from '../services/pushNotificationService';

interface SevereAlertsModalProps {
  alerts: SevereAlert[];
  isOpen: boolean;
  onClose: () => void;
  onTriggerTestAlert: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

export const SevereAlertsModal: React.FC<SevereAlertsModalProps> = ({
  alerts,
  isOpen,
  onClose,
  onTriggerTestAlert,
  notificationsEnabled,
  onToggleNotifications,
}) => {
  if (!isOpen) return null;

  const permission = pushNotificationService.getPermissionStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Severe Climate Alerts
              </h3>
              <p className="text-xs text-slate-400">
                {alerts.length === 0 ? 'No active emergencies' : `${alerts.length} active warning(s) in region`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Push Notification Permission Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Android Push Notifications
                </div>
                <div className="text-[11px] text-slate-400">
                  {permission === 'granted'
                    ? 'Push alerts active (sound + vibration)'
                    : 'Receive instantaneous severe storm warning pings'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {permission !== 'granted' ? (
                <button
                  onClick={onToggleNotifications}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition active:scale-95 shadow-md shadow-sky-500/20"
                >
                  Enable Push
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enabled
                </span>
              )}

              <button
                onClick={onTriggerTestAlert}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition active:scale-95 flex items-center gap-1.5"
                title="Send test notification with sound and vibration"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Alert</span>
              </button>
            </div>
          </div>

          {/* Alerts List */}
          {alerts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">
                Atmospheric Conditions Normal
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                No severe storms, high wind hazards, flash flood watches, or extreme temperature alerts currently detected in your forecast area.
              </p>
              <button
                onClick={onTriggerTestAlert}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium border border-slate-700 transition flex items-center gap-2"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Simulate Severe Thunderstorm Warning</span>
              </button>
            </div>
          ) : (
            alerts.map((alert) => {
              const isExtreme = alert.severity === 'extreme';
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-4 border space-y-3 ${
                    isExtreme
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-100'
                      : 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isExtreme ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {alert.area}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {alert.title}
                      </h4>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(alert.onset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Recommended Action:
                    </div>
                    <p className="text-xs text-amber-200 font-medium">
                      {alert.instruction}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Source: {alert.source}</span>
                    <span>Expires: {new Date(alert.expires).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
