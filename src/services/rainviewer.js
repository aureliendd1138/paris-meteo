const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';

export async function getRainViewerData() {
  try {
    const response = await fetch(RAINVIEWER_API);
    const data = await response.json();
    return {
      host: data.host,
      radar: {
        past: data.radar.past || [],
        nowcast: data.radar.nowcast || []
      },
      satellite: {
        infrared: data.satellite?.infrared || []
      }
    };
  } catch (error) {
    console.error('Erreur RainViewer:', error);
    return null;
  }
}

export function getRadarTileUrl(host, path, colorScheme = 4) {
  // colorScheme: 1=Original, 2=Universal Blue, 3=TITAN, 4=The Weather Channel, 5=Meteored, 6=NEXRAD Level III, 7=Rainbow @ SELEX-IS, 8=Dark Sky
  return `${host}${path}/256/{z}/{x}/{y}/${colorScheme}/1_1.png`;
}

export function getSatelliteTileUrl(host, path) {
  return `${host}${path}/256/{z}/{x}/{y}/0/0_0.png`;
}

export function formatRadarTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
