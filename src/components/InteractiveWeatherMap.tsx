import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Battery,
  MapPin,
  Plus,
  Minus,
  Check,
  Eye,
} from 'lucide-react';
import { GeoLocation } from '../types/weather';

interface InteractiveWeatherMapProps {
  location: GeoLocation;
  currentTemp?: number;
  conditionLabel?: string;
  isPowerSaver?: boolean;
  onSelectCoordinates?: (lat: number, lon: number) => void;
}

interface RainViewerFrame {
  time: number;
  path: string;
}

type BasemapStyle = 'dark' | 'streets' | 'satellite';

// RainViewer radar tiles exist up to zoom 12. Capping at 11 prevents any "Zoom Level Not Support" tile errors.
const MIN_ZOOM = 3;
const MAX_ZOOM = 11;

export const InteractiveWeatherMap: React.FC<InteractiveWeatherMapProps> = ({
  location,
  currentTemp,
  conditionLabel,
  isPowerSaver = false,
  onSelectCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);

  const [basemapStyle, setBasemapStyle] = useState<BasemapStyle>('dark');
  const [radarFrames, setRadarFrames] = useState<RainViewerFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(!isPowerSaver);
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);
  const [radarTimestamp, setRadarTimestamp] = useState<string>('');
  const [opacity, setOpacity] = useState<number>(0.8);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);

  const radarFramesRef = useRef(radarFrames);
  radarFramesRef.current = radarFrames;

  // Fetch free RainViewer radar frames
  useEffect(() => {
    let isMounted = true;
    async function fetchRadarData() {
      setIsLoadingRadar(true);
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error('Failed to fetch radar frames');
        const data = await res.json();
        if (data.radar && data.radar.past && isMounted) {
          const pastFrames: RainViewerFrame[] = data.radar.past;
          const nowcastFrames: RainViewerFrame[] = data.radar.nowcast || [];
          const allFrames = [...pastFrames, ...nowcastFrames];
          setRadarFrames(allFrames);
          if (allFrames.length > 0) {
            const startIdx = Math.max(0, pastFrames.length - 1);
            setCurrentFrameIndex(startIdx);
            const date = new Date(allFrames[startIdx].time * 1000);
            setRadarTimestamp(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (err) {
        console.warn('RainViewer radar API error:', err);
      } finally {
        if (isMounted) setIsLoadingRadar(false);
      }
    }

    fetchRadarData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to create basemap layer with zoom constraints
  const createBasemapLayer = (style: BasemapStyle): L.TileLayer => {
    if (style === 'streets') {
      return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
      });
    }

    if (style === 'satellite') {
      return L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
        }
      );
    }

    // Default: Dark Mode via OpenStreetMap with CSS dark filter
    return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      className: 'osm-dark-tiles',
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    });
  };

  // Initialize Leaflet Map with strict zoom limits
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const basemap = createBasemapLayer(basemapStyle);
      basemapLayerRef.current = basemap;

      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 7,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomControl: false,
        layers: [basemap],
      });

      // Custom pulse marker
      const customIcon = L.divIcon({
        className: 'custom-weather-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-sky-500/30 animate-ping absolute"></div>
            <div class="w-5 h-5 rounded-full bg-sky-400 border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Click on map to pick coordinates
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onSelectCoordinates) {
          onSelectCoordinates(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Update Basemap layer when style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (basemapLayerRef.current) {
      map.removeLayer(basemapLayerRef.current);
    }

    const newBasemap = createBasemapLayer(basemapStyle);
    basemapLayerRef.current = newBasemap;
    newBasemap.addTo(map);

    if (radarLayerRef.current && showRadar) {
      radarLayerRef.current.bringToFront();
    }
  }, [basemapStyle]);

  // Update map center and marker when location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([location.latitude, location.longitude], Math.min(MAX_ZOOM, 7), {
        duration: 1.2,
      });
      if (markerRef.current) {
        markerRef.current.setLatLng([location.latitude, location.longitude]);
      }
    }
  }, [location.latitude, location.longitude]);

  // Update Radar Layer with strict maxZoom & maxNativeZoom to avoid "Zoom Level Not Support"
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!showRadar || radarFrames.length === 0) {
      if (radarLayerRef.current) {
        map.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
      return;
    }

    const frame = radarFrames[currentFrameIndex];
    if (!frame) return;

    const radarUrl = `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
    }

    const newLayer = L.tileLayer(radarUrl, {
      opacity: opacity,
      zIndex: 20,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxNativeZoom: 11,
    });
    newLayer.addTo(map);
    radarLayerRef.current = newLayer;

    const date = new Date(frame.time * 1000);
    setRadarTimestamp(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [currentFrameIndex, radarFrames, opacity, showRadar]);

  // Radar Animation Loop (respects battery saver)
  useEffect(() => {
    if (!isPlaying || isPowerSaver || !showRadar || radarFrames.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      if (document.hidden) return;
      setCurrentFrameIndex((prev) => {
        const next = (prev + 1) % radarFramesRef.current.length;
        return next;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [isPlaying, isPowerSaver, showRadar, radarFrames.length]);

  const handleStep = (direction: 'next' | 'prev') => {
    setIsPlaying(false);
    if (radarFrames.length === 0) return;
    if (direction === 'next') {
      setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
    } else {
      setCurrentFrameIndex((prev) => (prev - 1 + radarFrames.length) % radarFrames.length);
    }
  };

  const recenterMap = () => {
    mapInstanceRef.current?.setView([location.latitude, location.longitude], Math.min(MAX_ZOOM, 7));
  };

  const handleZoom = (delta: number) => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    if (delta > 0 && currentZoom < MAX_ZOOM) {
      mapInstanceRef.current.zoomIn();
    } else if (delta < 0 && currentZoom > MIN_ZOOM) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Map Floating HUD */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        {/* Location pill */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">{location.name}</span>
          {currentTemp !== undefined && (
            <span className="text-xs font-bold text-sky-400 border-l border-slate-700 pl-2">
              {Math.round(currentTemp)}°
            </span>
          )}
          {conditionLabel && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">• {conditionLabel}</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isPowerSaver && (
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-1 rounded-lg backdrop-blur-md">
              <Battery className="w-3 h-3" />
              <span>Eco</span>
            </div>
          )}

          {/* Layer Style Selector */}
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            title="Change Map Layers"
            className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition active:scale-95 ${
              showLayersMenu
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={recenterMap}
            title="Recenter location"
            className="p-2 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/60 shadow-lg hover:bg-slate-800 active:scale-95 transition"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Floating Layer Selector Dropdown */}
      {showLayersMenu && (
        <div className="absolute top-14 right-3 z-[410] w-48 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
              Basemap
            </div>
            <div className="space-y-1">
              {[
                { id: 'dark' as BasemapStyle, label: 'Dark Mode (OSM)' },
                { id: 'streets' as BasemapStyle, label: 'Standard Streets' },
                { id: 'satellite' as BasemapStyle, label: 'Satellite Imagery' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setBasemapStyle(style.id);
                    setShowLayersMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                    basemapStyle === style.id
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{style.label}</span>
                  {basemapStyle === style.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
              Weather Overlays
            </div>
            <button
              onClick={() => setShowRadar(!showRadar)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                showRadar
                  ? 'bg-teal-500/20 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>Live Doppler Radar</span>
              {showRadar && <Check className="w-3.5 h-3.5 text-teal-400" />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom Controls (+ / -) */}
      <div className="absolute right-3 top-28 z-[400] flex flex-col gap-1.5">
        <button
          onClick={() => handleZoom(1)}
          title="Zoom in (Max supported)"
          className="p-2 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/60 shadow-lg hover:bg-slate-800 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          title="Zoom out"
          className="p-2 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/60 shadow-lg hover:bg-slate-800 active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Map Leaflet Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Responsive Radar Timeline & Playback Bar */}
      {showRadar && (
        <div className="absolute bottom-3 left-2.5 right-2.5 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 overflow-hidden">
          {/* Top Status & Timeline Progress */}
          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400 shrink-0">
                LIVE DOPPLER RADAR
              </span>
              <span className="text-slate-400 font-mono text-[11px] truncate">
                {isLoadingRadar ? 'Connecting...' : radarTimestamp || 'Live'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
              <span className="text-[9px]">Past</span>
              <div className="w-12 sm:w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-sky-400 h-full transition-all duration-300"
                  style={{
                    width: `${radarFrames.length > 0 ? ((currentFrameIndex + 1) / radarFrames.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-sky-400 font-medium text-[9px]">Now</span>
            </div>
          </div>

          {/* Bottom Controls Row: Playback + Opacity + Intensity (Fully responsive, no overflow) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            {/* Play / Step Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleStep('prev')}
                disabled={radarFrames.length === 0}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 active:bg-slate-700 disabled:opacity-40 transition"
                title="Previous frame"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={radarFrames.length === 0}
                className="p-1.5 px-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition shadow-md shadow-sky-500/20 flex items-center justify-center"
                title={isPlaying ? 'Pause loop' : 'Play loop'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              </button>

              <button
                onClick={() => handleStep('next')}
                disabled={radarFrames.length === 0}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 active:bg-slate-700 disabled:opacity-40 transition"
                title="Next frame"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Opacity Slider: compact and securely enclosed */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
              <Eye className="w-3 h-3 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-14 sm:w-16 accent-sky-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                title={`Radar Opacity: ${Math.round(opacity * 100)}%`}
              />
              <span className="text-[9px] font-mono text-slate-400 w-6 text-right">
                {Math.round(opacity * 100)}%
              </span>
            </div>

            {/* Precipitation Intensity Scale (hidden on ultra-narrow, visible on typical mobile) */}
            <div className="hidden xs:flex items-center gap-1 text-[9px] text-slate-400 shrink-0">
              <span className="text-[8px]">Light</span>
              <div className="h-1.5 w-12 sm:w-16 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 via-rose-500 to-purple-600" />
              <span className="text-[8px]">Heavy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
