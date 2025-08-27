import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      } as GeolocationPositionError);
      setLoading(false);
      return;
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition(pos);
      setError(null);
      setLoading(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err);
      setLoading(false);
    };

    // Get current position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    });

    // Watch position changes
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { position, error, loading };
};