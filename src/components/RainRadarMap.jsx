import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useRainViewer } from '../hooks/useRainViewer';
import { RadarControls } from './RadarControls';
import 'leaflet/dist/leaflet.css';

function RadarLayer({ url }) {
  const map = useMap();

  useEffect(() => {
    if (!url) return;

    const layer = L.tileLayer(url, {
      opacity: 0.7,
      zIndex: 100
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [url, map]);

  return null;
}

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lon], map.getZoom());
  }, [center, map]);

  return null;
}

export function RainRadarMap({ center }) {
  const {
    loading,
    error,
    currentFrame,
    currentFrameIndex,
    totalFrames,
    isPastFrame,
    isPlaying,
    setIsPlaying,
    setCurrentFrameIndex,
    getCurrentRadarUrl
  } = useRainViewer();

  const radarUrl = getCurrentRadarUrl();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">🌀</div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du radar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-red-500">
          <p className="text-4xl mb-3">⚠️</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={6}
        minZoom={4}
        maxZoom={10}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {radarUrl && <RadarLayer url={radarUrl} />}
        <MapUpdater center={center} />
      </MapContainer>

      <RadarControls
        currentFrame={currentFrame}
        currentFrameIndex={currentFrameIndex}
        totalFrames={totalFrames}
        isPastFrame={isPastFrame}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onFrameChange={setCurrentFrameIndex}
      />

      {/* Légende */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg p-2 text-xs">
        <div className="font-medium mb-1 text-gray-700 dark:text-gray-300">Intensité</div>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#88ddff' }} title="Faible"></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00ff00' }} title="Modérée"></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffff00' }} title="Forte"></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff8800' }} title="Très forte"></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff0000' }} title="Extrême"></div>
        </div>
      </div>
    </div>
  );
}
