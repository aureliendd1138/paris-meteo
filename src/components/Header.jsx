import { useTheme } from '../hooks/useTheme';

export function Header({ currentWeather }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌧️</span>
          <div>
            <h1 className="text-lg font-bold">Paris Météo</h1>
            {currentWeather && (
              <p className="text-xs text-blue-100 dark:text-gray-400">
                {Math.round(currentWeather.main.temp)}°C - {currentWeather.weather[0].description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentWeather && (
            <div className="hidden sm:flex items-center gap-2 text-sm mr-4">
              <span>💨 {Math.round(currentWeather.wind.speed)} km/h</span>
              <span>💧 {currentWeather.main.humidity}%</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Changer de thème"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
