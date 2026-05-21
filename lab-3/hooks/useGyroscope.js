import { useState, useEffect, useCallback } from 'react';
import { Gyroscope } from 'expo-sensors';
import { DEFAULT_INTERVAL_MS } from '../constants/sensorConfig';

// Hook for the gyroscope sensor.
export function useGyroscope(intervalMs = DEFAULT_INTERVAL_MS) {
  const [data, setData] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [isActive, setIsActive] = useState(false);

  // Step 1: check if the hardware exists on this device
  useEffect(() => {
    Gyroscope.isAvailableAsync().then(setIsAvailable);
  }, []);

  // Step 2: request permission only if the sensor is available
  useEffect(() => {
    if (isAvailable === null || !isAvailable) return;

    Gyroscope.requestPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status);
    });
  }, [isAvailable]);

  // Step 3: subscribe when permission is granted and sensor is available; clean up on unmount
  useEffect(() => {
    if (!isAvailable || permissionStatus !== 'granted') return;

    Gyroscope.setUpdateInterval(intervalMs);
    const subscription = Gyroscope.addListener(setData);
    setIsActive(true);

    return () => {
      subscription.remove();
      setIsActive(false);
    };
  }, [isAvailable, permissionStatus, intervalMs]);

  // Lets the user retry if they previously denied the permission
  const requestPermission = useCallback(async () => {
    const { status } = await Gyroscope.requestPermissionsAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  return { data, isAvailable, permissionStatus, isActive, requestPermission };
}
