import { useState, useEffect } from 'react';

// Coordonnées de Paris par défaut
const PARIS_COORDS = { lat: 48.8566, lon: 2.3522 };

export function useGeolocation() {
  const [location, setLocation] = useState(PARIS_COORDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Vérifier si on est dans la région parisienne (environ 100km)
        const distanceFromParis = Math.sqrt(
          Math.pow(latitude - PARIS_COORDS.lat, 2) +
          Math.pow(longitude - PARIS_COORDS.lon, 2)
        );

        if (distanceFromParis < 1.5) {
          setLocation({ lat: latitude, lon: longitude });
        } else {
          // Trop loin de Paris, garder Paris par défaut
          setLocation(PARIS_COORDS);
        }
        setLoading(false);
      },
      (err) => {
        console.log('Géolocalisation refusée, utilisation de Paris par défaut');
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, loading, error, defaultLocation: PARIS_COORDS };
}
