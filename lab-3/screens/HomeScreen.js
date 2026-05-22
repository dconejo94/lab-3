import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ onNavigate }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the game button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient effect via layered views */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.title}>Sensor Lab</Text>
        <Text style={styles.subtitle}>
          Explore your device's hardware sensors{'\n'}and battle a dragon!
        </Text>

        {/* Sensor cards */}
        <View style={styles.cardsRow}>
          <TouchableOpacity
            style={[styles.card, styles.accelCard]}
            onPress={() => onNavigate('accelerometer')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>🏃</Text>
            <Text style={styles.cardTitle}>Accelerometer</Text>
            <Text style={styles.cardDesc}>Motion & shake data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.gyroCard]}
            onPress={() => onNavigate('gyroscope')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>🌀</Text>
            <Text style={styles.cardTitle}>Gyroscope</Text>
            <Text style={styles.cardDesc}>Rotation & tilt data</Text>
          </TouchableOpacity>
        </View>

        {/* Game button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.gameButton}
            onPress={() => onNavigate('game')}
            activeOpacity={0.85}
          >
            <Text style={styles.gameEmoji}>⚔️🐉</Text>
            <Text style={styles.gameTitle}>Dragon Slayer</Text>
            <Text style={styles.gameDesc}>
              Use sensors to fight a dragon!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  bgTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  bgBottom: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#e2e8f0',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  card: {
    width: (width - 62) / 2,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  accelCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  gyroCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  gameButton: {
    width: width - 48,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  gameEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 1.5,
  },
  gameDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
});
