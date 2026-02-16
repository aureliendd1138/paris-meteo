// OpenWeatherMap API - clé gratuite requise
// Obtenir une clé sur: https://openweathermap.org/api

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const BASE_URL_3 = 'https://api.openweathermap.org/data/3.0';

export async function getCurrentWeather(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
    );
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    console.error('Erreur météo actuelle:', error);
    return null;
  }
}

export async function getForecast(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
    );
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    console.error('Erreur prévisions:', error);
    return null;
  }
}

export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function processForecastForChart(forecastData) {
  if (!forecastData?.list) return null;

  // Grouper par jour et extraire les précipitations
  const dailyRain = {};

  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

    if (!dailyRain[dayKey]) {
      dailyRain[dayKey] = 0;
    }

    // Ajouter pluie ou neige
    const rain = item.rain?.['3h'] || 0;
    const snow = item.snow?.['3h'] || 0;
    dailyRain[dayKey] += rain + snow;
  });

  return {
    labels: Object.keys(dailyRain).slice(0, 7),
    data: Object.values(dailyRain).slice(0, 7).map(v => Math.round(v * 10) / 10)
  };
}

// Extraire les données du jour depuis les prévisions
export function getTodayStats(forecastData) {
  if (!forecastData?.list) return null;

  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now - 86400000).toDateString();

  // Filtrer les données d'aujourd'hui
  const todayData = forecastData.list.filter(item => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate.toDateString() === todayStr;
  });

  // Données d'hier (pour comparaison pression)
  const yesterdayData = forecastData.list.filter(item => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate.toDateString() === yesterdayStr;
  });

  if (todayData.length === 0) {
    // Si pas de données aujourd'hui, prendre les premières disponibles
    todayData.push(...forecastData.list.slice(0, 8));
  }

  // Calculs
  const temps = todayData.map(d => d.main.temp);
  const winds = todayData.map(d => d.wind.speed);
  const pressures = todayData.map(d => d.main.pressure);
  const rain = todayData.reduce((sum, d) => sum + (d.rain?.['3h'] || 0) + (d.snow?.['3h'] || 0), 0);

  const avgPressureToday = pressures.reduce((a, b) => a + b, 0) / pressures.length;
  const avgPressureYesterday = yesterdayData.length > 0
    ? yesterdayData.map(d => d.main.pressure).reduce((a, b) => a + b, 0) / yesterdayData.length
    : avgPressureToday;

  return {
    tempMin: Math.round(Math.min(...temps)),
    tempMax: Math.round(Math.max(...temps)),
    rainTotal: Math.round(rain * 10) / 10,
    windMin: Math.round(Math.min(...winds) * 3.6), // m/s -> km/h
    windMax: Math.round(Math.max(...winds) * 3.6),
    pressure: Math.round(avgPressureToday),
    pressureChange: Math.round(avgPressureToday - avgPressureYesterday),
    humidity: Math.round(todayData.map(d => d.main.humidity).reduce((a, b) => a + b, 0) / todayData.length)
  };
}

// Données de démo si pas de clé API
export function getDemoForecast() {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date().getDay();
  const labels = [];
  for (let i = 0; i < 7; i++) {
    labels.push(days[(today + i) % 7]);
  }

  return {
    labels,
    data: [2.5, 0.8, 5.2, 12.1, 3.4, 0, 1.8]
  };
}

export function getDemoCurrentWeather() {
  return {
    main: {
      temp: 14,
      feels_like: 12,
      humidity: 78,
      pressure: 1015
    },
    weather: [{
      description: 'nuageux',
      icon: '04d'
    }],
    wind: {
      speed: 12
    },
    name: 'Paris'
  };
}

export function getDemoTodayStats() {
  return {
    tempMin: 8,
    tempMax: 16,
    rainTotal: 2.5,
    windMin: 8,
    windMax: 25,
    pressure: 1018,
    pressureChange: 3,
    humidity: 72
  };
}
