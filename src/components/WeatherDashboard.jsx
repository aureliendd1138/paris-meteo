import { useEffect, useState } from 'react';
import { getForecast, getTodayStats, getDemoTodayStats, getCurrentWeather, getDemoCurrentWeather } from '../services/weather';

function StatCard({ icon, label, value, subValue, trend }) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return null;
    if (trend > 0) return <span className="text-green-500">↑ +{trend}</span>;
    return <span className="text-red-500">↓ {trend}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-4xl">{icon}</span>
        {getTrendIcon()}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
      {subValue && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>
      )}
    </div>
  );
}

export function WeatherDashboard({ location }) {
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [forecastData, weatherData] = await Promise.all([
        getForecast(location.lat, location.lon),
        getCurrentWeather(location.lat, location.lon)
      ]);

      if (forecastData && weatherData) {
        setStats(getTodayStats(forecastData));
        setWeather(weatherData);
        setIsDemo(false);
      } else {
        setStats(getDemoTodayStats());
        setWeather(getDemoCurrentWeather());
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
          <div className="animate-pulse text-5xl mb-4">🌤️</div>
          <p className="text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const getPressureTrend = () => {
    if (!stats) return '';
    if (stats.pressureChange > 2) return 'Temps en amélioration';
    if (stats.pressureChange < -2) return 'Temps en dégradation';
    return 'Temps stable';
  };

  const getPressureIcon = () => {
    if (!stats) return '🌡️';
    if (stats.pressureChange > 2) return '☀️';
    if (stats.pressureChange < -2) return '🌧️';
    return '⛅';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-auto">
      <div className="max-w-4xl mx-auto p-4">
        {/* En-tête avec météo actuelle */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-3xl p-6 mb-6 text-white shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="text-8xl mb-2">
              {weather?.weather?.[0]?.icon?.includes('01') ? '☀️' :
               weather?.weather?.[0]?.icon?.includes('02') ? '⛅' :
               weather?.weather?.[0]?.icon?.includes('03') ? '☁️' :
               weather?.weather?.[0]?.icon?.includes('04') ? '☁️' :
               weather?.weather?.[0]?.icon?.includes('09') ? '🌧️' :
               weather?.weather?.[0]?.icon?.includes('10') ? '🌦️' :
               weather?.weather?.[0]?.icon?.includes('11') ? '⛈️' :
               weather?.weather?.[0]?.icon?.includes('13') ? '❄️' :
               weather?.weather?.[0]?.icon?.includes('50') ? '🌫️' : '🌤️'}
            </div>
            <h2 className="text-xl opacity-90">{weather?.name || 'Paris'}</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-7xl font-light">{Math.round(weather?.main?.temp || 0)}°</span>
              <span className="text-2xl opacity-75">C</span>
            </div>
            <p className="text-lg mt-2 capitalize opacity-90">
              {weather?.weather?.[0]?.description || 'Chargement...'}
            </p>
            <p className="text-sm opacity-75 mt-1">
              Ressenti {Math.round(weather?.main?.feels_like || 0)}°C
            </p>
          </div>

          {isDemo && (
            <div className="mt-4 bg-white/20 rounded-xl p-3 text-sm">
              <span className="opacity-90">Mode démo - En attente d'activation de la clé API</span>
            </div>
          )}
        </div>

        {/* Grille de statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="🌡️"
            label="Températures"
            value={`${stats?.tempMin}° / ${stats?.tempMax}°`}
            subValue="Min / Max du jour"
          />
          <StatCard
            icon="💧"
            label="Pluviométrie"
            value={`${stats?.rainTotal} mm`}
            subValue="Cumul du jour"
          />
          <StatCard
            icon="💨"
            label="Vent"
            value={`${stats?.windMin} - ${stats?.windMax}`}
            subValue="km/h (min-max)"
          />
          <StatCard
            icon={getPressureIcon()}
            label="Pression"
            value={`${stats?.pressure} hPa`}
            subValue={getPressureTrend()}
            trend={stats?.pressureChange}
          />
        </div>

        {/* Indicateur de tendance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            📊 Tendance barométrique
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats?.pressureChange > 0 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{
                    width: `${Math.min(100, 50 + (stats?.pressureChange || 0) * 5)}%`,
                    marginLeft: stats?.pressureChange < 0 ? 'auto' : 0
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Dépression</span>
                <span>Stable</span>
                <span>Anticyclone</span>
              </div>
            </div>
            <div className="text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.pressureChange > 0 ? '+' : ''}{stats?.pressureChange}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">hPa vs hier</p>
            </div>
          </div>
        </div>

        {/* Humidité */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💦</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Humidité</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{stats?.humidity}%</p>
              </div>
            </div>
            <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${stats?.humidity}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
