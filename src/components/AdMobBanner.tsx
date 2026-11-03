import React, { useState, useEffect } from 'react';
import { ExternalLink, Info, X } from 'lucide-react';

const SAMPLE_ADS = [
  {
    tag: 'AdMob',
    title: 'TrailMaster Pro 40L',
    description: 'All-weather waterproof alpine pack. 25% off today.',
    sponsor: 'AlpineGear Co.',
    cta: 'Shop Now',
    color: 'from-blue-900/60 to-slate-900/90',
  },
  {
    tag: 'AdMob',
    title: 'EcoFlow Smart Home Battery',
    description: 'Keep your backup power ready during severe storm outages.',
    sponsor: 'EcoFlow Energy',
    cta: 'Learn More',
    color: 'from-emerald-950/60 to-slate-900/90',
  },
  {
    tag: 'AdMob',
    title: 'AeroCloud Thermostat',
    description: 'Save up to 23% on HVAC with AI micro-climate scheduling.',
    sponsor: 'AeroSmart Tech',
    cta: 'Install Now',
    color: 'from-amber-950/60 to-slate-900/90',
  },
];

export const AdMobBanner: React.FC = () => {
  const [adIndex, setAdIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // Subtle rotation every 25 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
    }, 25000);
    return () => clearInterval(timer);
  }, []);

  const currentAd = SAMPLE_ADS[adIndex];

  return (
    <div className="w-full flex flex-col items-center justify-center bg-slate-950 border-t border-slate-800/80 px-2 py-1 select-none">
      {/* Standard Mobile Banner Frame (320x50 max-w-sm) */}
      <div className="relative w-full max-w-[360px] h-[50px] bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between overflow-hidden shadow-inner">
        {/* Subtle Ad indicator & text */}
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1 py-0.2 rounded tracking-tight">
              Ad
            </span>
            <span className="text-[7px] text-slate-500 font-mono mt-0.5">AdMob</span>
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {currentAd.title}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                • {currentAd.sponsor}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {currentAd.description}
            </p>
          </div>
        </div>

        {/* CTA & Info */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setShowInfo(true)}
            className="text-[10px] font-medium bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 px-2 py-1 rounded-md transition active:scale-95 flex items-center gap-1"
          >
            <span>{currentAd.cta}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>

          <button
            onClick={() => setShowInfo(true)}
            title="AdMob Ad Info"
            className="p-1 text-slate-500 hover:text-slate-300 transition"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* AdMob Configuration Details Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40 px-1.5 py-0.5 rounded">
                  AdMob
                </span>
                <h4 className="text-sm font-semibold text-slate-100">AdMob Banner Unit</h4>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              This permanent unit is configured for Google AdMob standard banner (320x50 dp). When exported to Android APK / TWA via Google Play, your real AdMob Ad Unit ID (`ca-app-pub-xxx`) can be dropped into the container without layout shift.
            </p>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1 mb-4">
              <div>Type: Standard Smart Banner</div>
              <div>Size: 320 x 50 dp (Responsive)</div>
              <div>Battery Impact: Zero (&lt; 0.01% CPU)</div>
              <div>Placement: Fixed bottom anchor</div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
