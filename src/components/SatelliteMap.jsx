import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

function WeatherLayer({ layer, opacity = 0.6 }) {
  const map = useMap();

  useEffect(() => {
    if (!OWM_API_KEY || OWM_API_KEY === 'DEMO_KEY') return;

    const weatherLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      { opacity, zIndex: 100 }
    );

    weatherLayer.addTo(map);

    return () => {
      map.removeLayer(weatherLayer);
    };
  }, [layer, opacity, map]);

  return null;
}

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lon], map.getZoom());
  }, [center, map]);

  return null;
}

export function SatelliteMap({ center }) {
  const [activeLayer, setActiveLayer] = useState('clouds_new');
  const hasApiKey = OWM_API_KEY && OWM_API_KEY !== 'DEMO_KEY';

  const layers = [
    { id: 'clouds_new', name: 'Nuages', icon: '☁️' },
    { id: 'precipitation_new', name: 'Précipitations', icon: '🌧️' },
    { id: 'pressure_new', name: 'Pression', icon: '🌡️' },
    { id: 'wind_new', name: 'Vent', icon: '💨' },
    { id: 'temp_new', name: 'Température', icon: '🌡️' }
  ];

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={4}
        minZoom={3}
        maxZoom={8}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {hasApiKey && <WeatherLayer layer={activeLayer} />}
        <MapUpdater center={center} />
      </MapContainer>

      {/* Sélecteur de couche */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl p-3 shadow-lg">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">🛰️ Couches météo</h3>
        <div className="flex flex-wrap gap-1">
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                activeLayer === layer.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {layer.icon} {layer.name}
            </button>
          ))}
        </div>
      </div>

      {!hasApiKey && (
        <div className="absolute inset-0 z-[500] bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 m-4 max-w-sm text-center shadow-xl">
            <p className="text-4xl mb-3">🔑</p>
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Clé API requise</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Les couches satellite nécessitent une clé API OpenWeatherMap activée.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              La clé peut prendre quelques heures pour être activée.
            </p>
          </div>
        </div>
      )}

      {/* Légende */}
      {hasApiKey && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg p-2 text-xs">
          <div className="font-medium mb-1 text-gray-700 dark:text-gray-300">
            {layers.find(l => l.id === activeLayer)?.name}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Faible</span>
            <div className="flex">
              <div className="w-4 h-4 bg-blue-200"></div>
              <div className="w-4 h-4 bg-blue-400"></div>
              <div className="w-4 h-4 bg-blue-600"></div>
              <div className="w-4 h-4 bg-blue-800"></div>
            </div>
            <span className="text-gray-500">Fort</span>
          </div>
        </div>
      )}
    </div>
  );
}
