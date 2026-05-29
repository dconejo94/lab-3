import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Gyroscope } from 'expo-sensors';
import { useGyroscope } from '../useGyroscope';

jest.mock('expo-sensors', () => ({
  Gyroscope: {
    isAvailableAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
  },
}));

describe('useGyroscope', () => {
  let mockSubscription;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscription = { remove: jest.fn() };
    Gyroscope.addListener.mockReturnValue(mockSubscription);
  });

  // isAvailable should be null while the hardware check hasn't resolved yet
  it('starts with isAvailable null before the async check resolves', () => {
    Gyroscope.isAvailableAsync.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useGyroscope());

    expect(result.current.isAvailable).toBeNull();
  });

  // Once isAvailableAsync resolves true, the hook should reflect it
  it('sets isAvailable to true when the sensor is present', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(true);
    Gyroscope.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useGyroscope());

    await waitFor(() => expect(result.current.isAvailable).toBe(true));
  });

  // Devices without the hardware should land on false, not null
  it('sets isAvailable to false when the sensor is not present', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useGyroscope());

    await waitFor(() => expect(result.current.isAvailable).toBe(false));
  });

  // No point asking for permission if there is no hardware to use
  it('does not request permission when the sensor is unavailable', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(false);

    renderHook(() => useGyroscope());

    await waitFor(() =>
      expect(Gyroscope.requestPermissionsAsync).not.toHaveBeenCalled()
    );
  });

  // Permission request must be triggered once the hardware is confirmed
  it('requests permission when the sensor is available', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(true);
    Gyroscope.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    renderHook(() => useGyroscope());

    await waitFor(() =>
      expect(Gyroscope.requestPermissionsAsync).toHaveBeenCalledTimes(1)
    );
  });

  // Hardware available + permission granted → listener should be active
  it('activates the subscription when permission is granted', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(true);
    Gyroscope.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useGyroscope());

    await waitFor(() => expect(result.current.isActive).toBe(true));
    expect(Gyroscope.addListener).toHaveBeenCalledTimes(1);
    expect(Gyroscope.setUpdateInterval).toHaveBeenCalledTimes(1);
  });

  // Denied permission means no data stream and isActive stays false
  it('does not subscribe when permission is denied', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(true);
    Gyroscope.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useGyroscope());

    await waitFor(() => expect(result.current.permissionStatus).toBe('denied'));
    expect(result.current.isActive).toBe(false);
    expect(Gyroscope.addListener).not.toHaveBeenCalled();
  });

  // The listener must be cleaned up when the component unmounts to avoid memory leaks
  it('removes the subscription on unmount', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(true);
    Gyroscope.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result, unmount } = renderHook(() => useGyroscope());

    await waitFor(() => expect(result.current.isActive).toBe(true));

    unmount();

    expect(mockSubscription.remove).toHaveBeenCalledTimes(1);
  });

  // requestPermission() lets the user retry after a previous denial
  it('requestPermission updates permissionStatus when the user grants access', async () => {
    Gyroscope.isAvailableAsync.mockResolvedValue(true);
    Gyroscope.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useGyroscope());

    await waitFor(() => expect(result.current.permissionStatus).toBe('denied'));

    Gyroscope.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permissionStatus).toBe('granted');
  });
});
