import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';
import { useAccelerometer } from '../useAccelerometer';

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
  },
}));

describe('useAccelerometer', () => {
  let mockSubscription;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscription = { remove: jest.fn() };
    Accelerometer.addListener.mockReturnValue(mockSubscription);
  });

  // isAvailable should be null while the hardware check hasn't resolved yet
  it('starts with isAvailable null before the async check resolves', () => {
    Accelerometer.isAvailableAsync.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAccelerometer());

    expect(result.current.isAvailable).toBeNull();
  });

  // Once isAvailableAsync resolves true, the hook should reflect it
  it('sets isAvailable to true when the sensor is present', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Accelerometer.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useAccelerometer());

    await waitFor(() => expect(result.current.isAvailable).toBe(true));
  });

  // Devices without the hardware should land on false, not null
  it('sets isAvailable to false when the sensor is not present', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useAccelerometer());

    await waitFor(() => expect(result.current.isAvailable).toBe(false));
  });

  // No point asking for permission if there is no hardware to use
  it('does not request permission when the sensor is unavailable', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(false);

    renderHook(() => useAccelerometer());

    await waitFor(() =>
      expect(Accelerometer.requestPermissionsAsync).not.toHaveBeenCalled()
    );
  });

  // Permission request must be triggered once the hardware is confirmed
  it('requests permission when the sensor is available', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Accelerometer.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    renderHook(() => useAccelerometer());

    await waitFor(() =>
      expect(Accelerometer.requestPermissionsAsync).toHaveBeenCalledTimes(1)
    );
  });

  // Hardware available + permission granted → listener should be active
  it('activates the subscription when permission is granted', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Accelerometer.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useAccelerometer());

    await waitFor(() => expect(result.current.isActive).toBe(true));
    expect(Accelerometer.addListener).toHaveBeenCalledTimes(1);
    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledTimes(1);
  });

  // Denied permission means no data stream and isActive stays false
  it('does not subscribe when permission is denied', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Accelerometer.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useAccelerometer());

    await waitFor(() => expect(result.current.permissionStatus).toBe('denied'));
    expect(result.current.isActive).toBe(false);
    expect(Accelerometer.addListener).not.toHaveBeenCalled();
  });

  // The listener must be cleaned up when the component unmounts to avoid memory leaks
  it('removes the subscription on unmount', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Accelerometer.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result, unmount } = renderHook(() => useAccelerometer());

    await waitFor(() => expect(result.current.isActive).toBe(true));

    unmount();

    expect(mockSubscription.remove).toHaveBeenCalledTimes(1);
  });

  // requestPermission() lets the user retry after a previous denial
  it('requestPermission updates permissionStatus when the user grants access', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Accelerometer.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useAccelerometer());

    await waitFor(() => expect(result.current.permissionStatus).toBe('denied'));

    Accelerometer.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permissionStatus).toBe('granted');
  });
});
