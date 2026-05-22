import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useGyroscope } from '../hooks/useGyroscope';

const { width } = Dimensions.get('window');

export default function GyroscopeScreen({ onBack }) {
  const { data, isAvailable, permissionStatus, isActive, requestPermission } =
    useGyroscope(100);

  const x = data?.x ?? 0;
  const y = data?.y ?? 0;
  const z = data?.z ?? 0;
  const totalRotation = Math.sqrt(x * x + y * y + z * z);

  // Normalize bar widths (gyroscope values in rad/s, typical range -5 to 5)
  const barWidth = (val) => Math.min(Math.abs(val) / 5, 1) * (width - 100);

  if (isAvailable === false) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorEmoji}>🚫</Text>
        <Text style={styles.errorText}>
          Gyroscope not available on this device
        </Text>
      </View>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorEmoji}>🔒</Text>
        <Text style={styles.errorText}>Permission denied</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={requestPermission}>
          <Text style={styles.retryText}>Request Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.emoji}>🌀</Text>
      <Text style={styles.title}>Gyroscope</Text>
      <View style={styles.statusBadge}>
        <View
          style={[styles.dot, { backgroundColor: isActive ? '#22c55e' : '#ef4444' }]}
        />
        <Text style={styles.statusText}>
          {isActive ? 'Streaming' : 'Waiting…'}
        </Text>
      </View>

      {/* Live values */}
      <View style={styles.dataCard}>
        {/* X axis (pitch) */}
        <View style={styles.axisRow}>
          <Text style={[styles.axisLabel, { color: '#fb923c' }]}>X</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: barWidth(x),
                  backgroundColor: '#fb923c',
                },
              ]}
            />
          </View>
          <Text style={styles.axisValue}>{x.toFixed(3)}</Text>
        </View>

        {/* Y axis (roll) */}
        <View style={styles.axisRow}>
          <Text style={[styles.axisLabel, { color: '#a78bfa' }]}>Y</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: barWidth(y),
                  backgroundColor: '#a78bfa',
                },
              ]}
            />
          </View>
          <Text style={styles.axisValue}>{y.toFixed(3)}</Text>
        </View>

        {/* Z axis (yaw) */}
        <View style={styles.axisRow}>
          <Text style={[styles.axisLabel, { color: '#2dd4bf' }]}>Z</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: barWidth(z),
                  backgroundColor: '#2dd4bf',
                },
              ]}
            />
          </View>
          <Text style={styles.axisValue}>{z.toFixed(3)}</Text>
        </View>
      </View>

      {/* Total rotation speed */}
      <View style={styles.magCard}>
        <Text style={styles.magLabel}>Rotation Speed</Text>
        <Text style={styles.magValue}>{totalRotation.toFixed(3)} rad/s</Text>
      </View>

      {/* Rotation direction indicator */}
      <View style={styles.directionCard}>
        <Text style={styles.directionTitle}>Dominant Axis</Text>
        <Text style={styles.directionEmoji}>
          {Math.abs(x) > Math.abs(y) && Math.abs(x) > Math.abs(z)
            ? '↕️ Pitch (X)'
            : Math.abs(y) > Math.abs(z)
            ? '↔️ Roll (Y)'
            : '🔄 Yaw (Z)'}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How it works</Text>
        <Text style={styles.infoText}>
          The gyroscope measures angular velocity (rotation speed) around X, Y,
          and Z axes in radians per second. Try rotating your phone in different
          directions!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  backText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  emoji: {
    fontSize: 48,
    marginTop: 20,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  dataCard: {
    width: '100%',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  axisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  axisLabel: {
    fontSize: 18,
    fontWeight: '800',
    width: 28,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  axisValue: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    width: 65,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  magCard: {
    width: '100%',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  magLabel: {
    color: '#2dd4bf',
    fontSize: 15,
    fontWeight: '700',
  },
  magValue: {
    color: '#2dd4bf',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  directionCard: {
    width: '100%',
    backgroundColor: 'rgba(251, 146, 60, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  directionTitle: {
    color: '#fb923c',
    fontSize: 15,
    fontWeight: '700',
  },
  directionEmoji: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 16,
  },
  infoTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  errorEmoji: {
    fontSize: 56,
    marginTop: 100,
    marginBottom: 16,
  },
  errorText: {
    color: '#94a3b8',
    fontSize: 17,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  retryText: {
    color: '#a78bfa',
    fontSize: 15,
    fontWeight: '700',
  },
});
