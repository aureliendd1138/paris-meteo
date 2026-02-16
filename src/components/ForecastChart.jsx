import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getForecast, processForecastForChart, getDemoForecast, getDemoCurrentWeather } from '../services/weather';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ForecastChart({ location }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadForecast() {
      setLoading(true);
      const forecast = await getForecast(location.lat, location.lon);

      if (forecast) {
        const processed = processForecastForChart(forecast);
        setChartData(processed);
        setIsDemo(false);
      } else {
        // Utiliser données de démo
        setChartData(getDemoForecast());
        setIsDemo(true);
      }
      setLoading(false);
    }

    loadForecast();
  }, [location]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500">Chargement des prévisions...</div>
      </div>
    );
  }

  const data = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Précipitations (mm)',
        data: chartData?.data || [],
        backgroundColor: chartData?.data.map(val =>
          val > 10 ? 'rgba(239, 68, 68, 0.8)' :
          val > 5 ? 'rgba(249, 115, 22, 0.8)' :
          val > 2 ? 'rgba(59, 130, 246, 0.8)' :
          'rgba(147, 197, 253, 0.8)'
        ),
        borderColor: chartData?.data.map(val =>
          val > 10 ? 'rgb(239, 68, 68)' :
          val > 5 ? 'rgb(249, 115, 22)' :
          val > 2 ? 'rgb(59, 130, 246)' :
          'rgb(147, 197, 253)'
        ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.parsed.y} mm de pluie`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          callback: (value) => `${value} mm`
        }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              📊 Prévisions de pluie - 7 jours
            </h2>
            {isDemo && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                Données démo
              </span>
            )}
          </div>

          <div className="h-64 sm:h-80">
            <Bar data={data} options={options} />
          </div>
        </div>

        {/* Légende */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Légende des intensités</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200"></div>
              <span className="text-gray-600 dark:text-gray-400">Faible (&lt;2mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Modérée (2-5mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Forte (5-10mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Très forte (&gt;10mm)</span>
            </div>
          </div>
        </div>

        {isDemo && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">💡 Pour des données réelles</p>
            <p>Créez un fichier <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env</code> avec votre clé API OpenWeatherMap:</p>
            <code className="block mt-2 bg-blue-100 dark:bg-blue-800 p-2 rounded">
              VITE_OPENWEATHER_API_KEY=votre_clé_api
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
