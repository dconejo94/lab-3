import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useAccelerometer } from '../hooks/useAccelerometer';

const { width } = Dimensions.get('window');

export default function AccelerometerScreen({ onBack }) {
  const { data, isAvailable, permissionStatus, isActive, requestPermission } =
    useAccelerometer(100);

  const x = data?.x ?? 0;
  const y = data?.y ?? 0;
  const z = data?.z ?? 0;
  const magnitude = Math.sqrt(x * x + y * y + z * z);

  // Normalize bar widths (accelerometer values typically range -2 to 2 in normal use)
  const barWidth = (val) => Math.min(Math.abs(val) / 2, 1) * (width - 100);

  if (isAvailable === false) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorEmoji}>🚫</Text>
        <Text style={styles.errorText}>
          Accelerometer not available on this device
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
      <Text style={styles.emoji}>🏃</Text>
      <Text style={styles.title}>Accelerometer</Text>
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
        {/* X axis */}
        <View style={styles.axisRow}>
          <Text style={[styles.axisLabel, { color: '#f87171' }]}>X</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: barWidth(x),
                  backgroundColor: '#f87171',
                },
              ]}
            />
          </View>
          <Text style={styles.axisValue}>{x.toFixed(3)}</Text>
        </View>

        {/* Y axis */}
        <View style={styles.axisRow}>
          <Text style={[styles.axisLabel, { color: '#4ade80' }]}>Y</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: barWidth(y),
                  backgroundColor: '#4ade80',
                },
              ]}
            />
          </View>
          <Text style={styles.axisValue}>{y.toFixed(3)}</Text>
        </View>

        {/* Z axis */}
        <View style={styles.axisRow}>
          <Text style={[styles.axisLabel, { color: '#60a5fa' }]}>Z</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: barWidth(z),
                  backgroundColor: '#60a5fa',
                },
              ]}
            />
          </View>
          <Text style={styles.axisValue}>{z.toFixed(3)}</Text>
        </View>
      </View>

      {/* Magnitude */}
      <View style={styles.magCard}>
        <Text style={styles.magLabel}>Magnitude</Text>
        <Text style={styles.magValue}>{magnitude.toFixed(3)} g</Text>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How it works</Text>
        <Text style={styles.infoText}>
          The accelerometer measures acceleration forces on X, Y, and Z axes.
          At rest, you should see ~1g on one axis due to gravity. Try shaking
          your phone to see spikes!
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
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  magLabel: {
    color: '#fbbf24',
    fontSize: 15,
    fontWeight: '700',
  },
  magValue: {
    color: '#fbbf24',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  retryText: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '700',
  },
});
