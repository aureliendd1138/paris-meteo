import { useEffect, useState } from 'react';
import { getForecast, getDemoCurrentWeather } from '../services/weather';

function getWeatherEmoji(iconCode) {
  if (!iconCode) return '🌤️';
  if (iconCode.includes('01')) return '☀️';
  if (iconCode.includes('02')) return '⛅';
  if (iconCode.includes('03')) return '☁️';
  if (iconCode.includes('04')) return '☁️';
  if (iconCode.includes('09')) return '🌧️';
  if (iconCode.includes('10')) return '🌦️';
  if (iconCode.includes('11')) return '⛈️';
  if (iconCode.includes('13')) return '❄️';
  if (iconCode.includes('50')) return '🌫️';
  return '🌤️';
}

function HourCard({ data, isNow }) {
  const time = new Date(data.dt * 1000);
  const hour = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const rain = data.rain?.['3h'] || data.snow?.['3h'] || 0;

  return (
    <div className={`flex-shrink-0 w-24 p-4 rounded-2xl text-center transition-all ${
      isNow
        ? 'bg-blue-600 text-white shadow-lg scale-105'
        : 'bg-white dark:bg-gray-800 shadow-md'
    }`}>
      <p className={`text-sm font-medium ${isNow ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {isNow ? 'Maintenant' : hour}
      </p>
      <div className="text-4xl my-3">
        {getWeatherEmoji(data.weather?.[0]?.icon)}
      </div>
      <p className={`text-2xl font-bold ${isNow ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
        {Math.round(data.main.temp)}°
      </p>
      {rain > 0 && (
        <p className={`text-xs mt-1 ${isNow ? 'text-blue-100' : 'text-blue-500'}`}>
          💧 {rain.toFixed(1)}mm
        </p>
      )}
      <p className={`text-xs mt-1 ${isNow ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
        💨 {Math.round(data.wind.speed * 3.6)}km/h
      </p>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="font-semibold text-gray-800 dark:text-white">{value}</span>
    </div>
  );
}

export function HourlyForecast({ location }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getForecast(location.lat, location.lon);

      if (data?.list) {
        setForecast(data);
        setIsDemo(false);
      } else {
        // Données démo
        setForecast(generateDemoForecast());
        setIsDemo(true);
      }
      setLoading(false);
    }

    loadData();
  }, [location]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse text-5xl mb-4">🕐</div>
          <p className="text-gray-500 dark:text-gray-400">Chargement des prévisions...</p>
        </div>
      </div>
    );
  }

  // Filtrer pour avoir les 24 prochaines heures (8 créneaux de 3h)
  const hourlyData = forecast?.list?.slice(0, 8) || [];
  const nextHours = hourlyData[0];

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-auto">
      <div className="max-w-4xl mx-auto p-4">

        {isDemo && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-3 text-sm text-yellow-700 dark:text-yellow-300 text-center">
            Mode démo - En attente d'activation de la clé API
          </div>
        )}

        {/* Titre */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            🕐 Prévisions heure par heure
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {forecast?.city?.name || 'Paris'} - Prochaines 24 heures
          </p>
        </div>

        {/* Scroll horizontal des heures */}
        <div className="mb-6 -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {hourlyData.map((item, index) => (
              <HourCard key={item.dt} data={item} isNow={index === 0} />
            ))}
          </div>
        </div>

        {/* Détails pour la prochaine heure */}
        {nextHours && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
              📋 Détails - Prochaines heures
            </h3>

            <DetailRow
              icon="🌡️"
              label="Température"
              value={`${Math.round(nextHours.main.temp)}°C (ressenti ${Math.round(nextHours.main.feels_like)}°C)`}
            />
            <DetailRow
              icon="💧"
              label="Humidité"
              value={`${nextHours.main.humidity}%`}
            />
            <DetailRow
              icon="💨"
              label="Vent"
              value={`${Math.round(nextHours.wind.speed * 3.6)} km/h`}
            />
            <DetailRow
              icon="🌡️"
              label="Pression"
              value={`${nextHours.main.pressure} hPa`}
            />
            <DetailRow
              icon="☁️"
              label="Couverture nuageuse"
              value={`${nextHours.clouds?.all || 0}%`}
            />
            <DetailRow
              icon="👁️"
              label="Visibilité"
              value={`${((nextHours.visibility || 10000) / 1000).toFixed(1)} km`}
            />
            {(nextHours.rain?.['3h'] || nextHours.snow?.['3h']) > 0 && (
              <DetailRow
                icon="🌧️"
                label="Précipitations (3h)"
                value={`${(nextHours.rain?.['3h'] || nextHours.snow?.['3h'] || 0).toFixed(1)} mm`}
              />
            )}
          </div>
        )}

        {/* Résumé de la journée */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
            📊 Résumé des 24h
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Temp. max</p>
              <p className="text-2xl font-bold text-red-500">
                {Math.round(Math.max(...hourlyData.map(h => h.main.temp)))}°
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Temp. min</p>
              <p className="text-2xl font-bold text-blue-500">
                {Math.round(Math.min(...hourlyData.map(h => h.main.temp)))}°
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pluie totale</p>
              <p className="text-2xl font-bold text-blue-600">
                {hourlyData.reduce((sum, h) => sum + (h.rain?.['3h'] || 0) + (h.snow?.['3h'] || 0), 0).toFixed(1)} mm
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Vent max</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {Math.round(Math.max(...hourlyData.map(h => h.wind.speed)) * 3.6)} km/h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateDemoForecast() {
  const now = Math.floor(Date.now() / 1000);
  const list = [];

  for (let i = 0; i < 8; i++) {
    list.push({
      dt: now + i * 3 * 3600,
      main: {
        temp: 14 + Math.sin(i / 2) * 4,
        feels_like: 12 + Math.sin(i / 2) * 4,
        humidity: 65 + Math.random() * 20,
        pressure: 1015 + Math.random() * 10
      },
      weather: [{ icon: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)] }],
      wind: { speed: 3 + Math.random() * 5 },
      clouds: { all: Math.random() * 100 },
      visibility: 10000,
      rain: Math.random() > 0.7 ? { '3h': Math.random() * 3 } : undefined
    });
  }

  return { list, city: { name: 'Paris' } };
}
