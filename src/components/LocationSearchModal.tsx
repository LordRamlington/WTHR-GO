import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, X, Star, Trash2, Loader2 } from 'lucide-react';
import { GeoLocation } from '../types/weather';
import { searchLocations, reverseGeocode } from '../services/geocodingService';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: GeoLocation) => void;
  savedLocations: GeoLocation[];
  onToggleSaveLocation: (loc: GeoLocation) => void;
  currentSelectedId?: number;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  savedLocations,
  onToggleSaveLocation,
  currentSelectedId,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await searchLocations(query);
        setResults(found);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleUseGPS = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          onSelectLocation(loc);
          onClose();
        } catch {
          setLocationError('Failed to resolve address for coordinates.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Location access was denied. Please allow GPS permission in your browser.');
        } else {
          setLocationError('Unable to retrieve your current GPS coordinates.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Select Location</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, region or country..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            ) : query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* GPS Button */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80">
          <button
            onClick={handleUseGPS}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition active:scale-98 disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Acquiring GPS Signal...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>Use Current GPS Location</span>
              </>
            )}
          </button>
          {locationError && (
            <p className="text-[11px] text-rose-400 mt-2 text-center">{locationError}</p>
          )}
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Search Results */}
          {query.trim().length >= 2 ? (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Search Results
              </div>
              {results.length === 0 && !isSearching ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No cities found matching "{query}".
                </div>
              ) : (
                <div className="space-y-1.5">
                  {results.map((r) => {
                    const isSaved = savedLocations.some(
                      (s) => Math.abs(s.latitude - r.latitude) < 0.05 && Math.abs(s.longitude - r.longitude) < 0.05
                    );
                    return (
                      <div
                        key={`${r.latitude}-${r.longitude}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
                      >
                        <button
                          onClick={() => {
                            onSelectLocation(r);
                            onClose();
                          }}
                          className="flex-1 text-left flex flex-col"
                        >
                          <span className="text-xs font-semibold text-slate-200">
                            {r.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {[r.admin1, r.country].filter(Boolean).join(', ')}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveLocation(r);
                          }}
                          title={isSaved ? 'Remove from saved' : 'Save location'}
                          className="p-2 text-slate-400 hover:text-amber-400 transition"
                        >
                          <Star className={`w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Saved Locations */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Saved Cities ({savedLocations.length})
                </div>
                <div className="space-y-1.5">
                  {savedLocations.map((loc) => {
                    const isSelected = loc.id === currentSelectedId;
                    return (
                      <div
                        key={loc.id || `${loc.latitude}-${loc.longitude}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                          isSelected
                            ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => {
                            onSelectLocation(loc);
                            onClose();
                          }}
                          className="flex-1 text-left flex flex-col"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-100">
                              {loc.name}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-mono">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveLocation(loc);
                          }}
                          title="Remove saved city"
                          className="p-2 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
