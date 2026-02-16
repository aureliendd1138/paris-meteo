import { useState, useEffect, useCallback } from 'react';
import { getRainViewerData, getRadarTileUrl, getSatelliteTileUrl } from '../services/rainviewer';

export function useRainViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRainViewerData();
      if (result) {
        setData(result);
        // Commencer sur la dernière frame passée
        const pastFrames = result.radar.past.length;
        setCurrentFrameIndex(Math.max(0, pastFrames - 1));
        setError(null);
      } else {
        setError('Impossible de charger les données radar');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const allFrames = data ? [...data.radar.past, ...data.radar.nowcast] : [];
  const totalFrames = allFrames.length;

  useEffect(() => {
    if (!isPlaying || totalFrames === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % totalFrames);
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, totalFrames]);

  const currentFrame = allFrames[currentFrameIndex];
  const isPastFrame = data ? currentFrameIndex < data.radar.past.length : true;

  const getCurrentRadarUrl = useCallback(() => {
    if (!data || !currentFrame) return null;
    return getRadarTileUrl(data.host, currentFrame.path);
  }, [data, currentFrame]);

  const getSatelliteUrl = useCallback(() => {
    if (!data?.satellite?.infrared?.length) return null;
    const latestSatellite = data.satellite.infrared[data.satellite.infrared.length - 1];
    return getSatelliteTileUrl(data.host, latestSatellite.path);
  }, [data]);

  return {
    data,
    loading,
    error,
    currentFrame,
    currentFrameIndex,
    totalFrames,
    isPastFrame,
    isPlaying,
    setIsPlaying,
    setCurrentFrameIndex,
    getCurrentRadarUrl,
    getSatelliteUrl,
    refresh: fetchData
  };
}
