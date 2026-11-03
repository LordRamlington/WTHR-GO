import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  if (isInstallable) {
    return (
      <div className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-r from-sky-950/70 to-slate-900 border border-sky-500/30 shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100">
              Install WTHR-GO Android App
            </span>
            <span className="text-[10px] text-slate-400">
              Zero battery idle • Instant offline radar & forecasts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-md shadow-sky-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-500 hover:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="mx-3 my-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-300">
            Add WTHR-GO to your Home Screen for full screen mode
          </span>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 px-2 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20"
          >
            Instructions
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200">
              <h3 className="text-base font-semibold text-white">Install on Mobile</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                1. Tap the <strong>Share</strong> button in the browser toolbar.<br />
                2. Select <strong>Add to Home Screen</strong>.<br />
                3. WTHR-GO will launch seamlessly as a standalone Android/iOS app.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
