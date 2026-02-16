import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { WeatherDashboard } from './components/WeatherDashboard';
import { HourlyForecast } from './components/HourlyForecast';
import { RainRadarMap } from './components/RainRadarMap';
import { SatelliteMap } from './components/SatelliteMap';
import { ForecastChart } from './components/ForecastChart';
import { useGeolocation } from './hooks/useGeolocation';
import { getCurrentWeather, getDemoCurrentWeather } from './services/weather';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentWeather, setCurrentWeather] = useState(null);
  const { location, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    async function loadWeather() {
      const weather = await getCurrentWeather(location.lat, location.lon);
      if (weather) {
        setCurrentWeather(weather);
      } else {
        setCurrentWeather(getDemoCurrentWeather());
      }
    }
    loadWeather();
  }, [location]);

  if (geoLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
        <div className="text-center text-white">
          <div className="animate-bounce text-6xl mb-4">🌧️</div>
          <h1 className="text-2xl font-bold mb-2">Paris Météo</h1>
          <p className="text-blue-200">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header currentWeather={currentWeather} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'home' && <WeatherDashboard location={location} />}
        {activeTab === 'hourly' && <HourlyForecast location={location} />}
        {activeTab === 'radar' && <RainRadarMap center={location} />}
        {activeTab === 'satellite' && <SatelliteMap center={location} />}
        {activeTab === 'forecast' && <ForecastChart location={location} />}
      </main>
    </div>
  );
}

export default App;
