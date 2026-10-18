import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateLiveLocation } from '@/hooks/useQueries';

export const LiveLocationTracker = () => {
  const { isAuthenticated, employee } = useAuth();
  const updateLocationMutation = useUpdateLiveLocation();
  const lastSentRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !navigator.geolocation) return;

    const sendLocation = (latitude: number, longitude: number) => {
      // Do not send if tab is hidden in background
      if (typeof document !== 'undefined' && document.hidden) return;

      const now = Date.now();
      // Throttle sends to at most once every 45 seconds unless moved > 50 meters (~0.0005 deg)
      if (lastSentRef.current) {
        const timeDiff = now - lastSentRef.current.time;
        const latDiff = Math.abs(latitude - lastSentRef.current.lat);
        const lngDiff = Math.abs(longitude - lastSentRef.current.lng);
        if (timeDiff < 45000 && latDiff < 0.0005 && lngDiff < 0.0005) {
          return;
        }
      }

      lastSentRef.current = { lat: latitude, lng: longitude, time: now };
      updateLocationMutation.mutate(
        {
          latitude,
          longitude,
          employee: typeof employee?.id === 'number' ? employee.id : undefined,
        },
        {
          onError: () => {
            // Silently swallow network / backend cold-start errors
          },
        }
      );
    };

    // 1. Send initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );

    // 2. Watch position with low power
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        sendLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 15000 }
    );

    // 3. Periodic fallback interval (every 60 seconds)
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }, 60000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, employee]);

  return null;
};

export default LiveLocationTracker;
