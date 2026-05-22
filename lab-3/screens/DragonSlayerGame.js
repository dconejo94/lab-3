import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { useGyroscope } from '../hooks/useGyroscope';
import {
  PUNCH_THRESHOLD,
  PUNCH_COOLDOWN_MS,
  DODGE_THRESHOLD,
  DODGE_COOLDOWN_MS,
} from '../constants/sensorConfig';

const { width, height } = Dimensions.get('window');

const DRAGON_MAX_HP = 100;
const PLAYER_MAX_HP = 100;
const PUNCH_DAMAGE = 12;         // damage per shake-punch
const DRAGON_ATTACK_DAMAGE = 18; // damage if player fails to dodge
const DRAGON_ATTACK_INTERVAL = 5250; // ms between dragon attacks
const DRAGON_ATTACK_WINDOW = 1800;   // ms window to dodge

const PHASE = {
  INTRO: 'intro',
  BATTLE: 'battle',
  WIN: 'win',
  LOSE: 'lose',
};

export default function DragonSlayerGame({ onBack }) {
  // Sensors
  const accel = useAccelerometer(80);
  const gyro = useGyroscope(80);

  // Game state
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [dragonHp, setDragonHp] = useState(DRAGON_MAX_HP);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [message, setMessage] = useState('');
  const [dragonAttacking, setDragonAttacking] = useState(false);
  const [dodgeSuccess, setDodgeSuccess] = useState(null); // true/false/null
  const [combo, setCombo] = useState(0);
  const [totalPunches, setTotalPunches] = useState(0);

  // Cooldown refs
  const lastPunchTime = useRef(0);
  const lastDodgeTime = useRef(0);
  const attackTimerRef = useRef(null);
  const attackWindowRef = useRef(null);
  const dodgedThisAttack = useRef(false);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dragonScale = useRef(new Animated.Value(1)).current;
  const playerFlash = useRef(new Animated.Value(0)).current;
  const dragonFlash = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

    const showMessage = useCallback(
    (msg) => {
      setMessage(msg);
      messageOpacity.setValue(1);
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    },
    [messageOpacity]
  );

    const flashDragon = useCallback(() => {
    dragonFlash.setValue(1);
    Animated.timing(dragonFlash, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [dragonFlash]);

    const flashPlayer = useCallback(() => {
    playerFlash.setValue(1);
    Animated.timing(playerFlash, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [playerFlash]);

    useEffect(() => {
    if (phase !== PHASE.BATTLE || !accel.data) return;

    const { x, y, z } = accel.data;
    const mag = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (mag > PUNCH_THRESHOLD && now - lastPunchTime.current > PUNCH_COOLDOWN_MS) {
      lastPunchTime.current = now;

      // Calculate damage with combo bonus
      const comboMultiplier = 1 + Math.min(combo, 5) * 0.1;
      const damage = Math.round(PUNCH_DAMAGE * comboMultiplier);

      setDragonHp((prev) => {
        const next = Math.max(0, prev - damage);
        if (next <= 0) {
          setPhase(PHASE.WIN);
        }
        return next;
      });
      setCombo((c) => c + 1);
      setTotalPunches((p) => p + 1);

      // Visual feedback
      flashDragon();
      Vibration.vibrate(50);

      if (combo > 0 && combo % 3 === 0) {
        showMessage(`🔥 ${combo + 1}x COMBO! −${damage} HP`);
      } else {
        showMessage(`⚔️ PUNCH! −${damage} HP`);
      }

      // Shake the dragon
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [accel.data, phase, combo, flashDragon, showMessage, shakeAnim]);

    useEffect(() => {
    if (phase !== PHASE.BATTLE || !gyro.data || !dragonAttacking) return;

    const { x, y, z } = gyro.data;
    const rotMag = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (
      rotMag > DODGE_THRESHOLD &&
      now - lastDodgeTime.current > DODGE_COOLDOWN_MS &&
      !dodgedThisAttack.current
    ) {
      lastDodgeTime.current = now;
      dodgedThisAttack.current = true;
      setDodgeSuccess(true);
      showMessage('🛡️ DODGED!');
      Vibration.vibrate(30);

      // Reset dodge indicator after a moment
      setTimeout(() => setDodgeSuccess(null), 800);
    }
  }, [gyro.data, phase, dragonAttacking, showMessage]);

    useEffect(() => {
    if (phase !== PHASE.BATTLE) return;

    const startAttackCycle = () => {
      attackTimerRef.current = setInterval(() => {
        // Dragon starts attacking
        setDragonAttacking(true);
        dodgedThisAttack.current = false;
        setDodgeSuccess(null);
        showMessage('🔥 DRAGON ATTACKS! Tilt to dodge!');

        // Dragon scales up menacingly
        Animated.sequence([
          Animated.timing(dragonScale, {
            toValue: 1.15,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dragonScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // After the dodge window, check if player dodged
        attackWindowRef.current = setTimeout(() => {
          setDragonAttacking(false);

          if (!dodgedThisAttack.current) {
            // Player didn't dodge — take damage
            setPlayerHp((prev) => {
              const next = Math.max(0, prev - DRAGON_ATTACK_DAMAGE);
              if (next <= 0) {
                setPhase(PHASE.LOSE);
              }
              return next;
            });
            setCombo(0); // reset combo on hit
            setDodgeSuccess(false);
            flashPlayer();
            Vibration.vibrate(200);
            showMessage(`💥 HIT! −${DRAGON_ATTACK_DAMAGE} HP`);
            setTimeout(() => setDodgeSuccess(null), 800);
          }
        }, DRAGON_ATTACK_WINDOW);
      }, DRAGON_ATTACK_INTERVAL);
    };

    startAttackCycle();

    return () => {
      clearInterval(attackTimerRef.current);
      clearTimeout(attackWindowRef.current);
    };
  }, [phase, dragonScale, flashPlayer, showMessage]);

    const resetGame = () => {
    setDragonHp(DRAGON_MAX_HP);
    setPlayerHp(PLAYER_MAX_HP);
    setCombo(0);
    setTotalPunches(0);
    setDragonAttacking(false);
    setDodgeSuccess(null);
    setMessage('');
    dodgedThisAttack.current = false;
    setPhase(PHASE.BATTLE);
  };

    const HpBar = ({ current, max, color, label }) => {
    const pct = (current / max) * 100;
    return (
      <View style={styles.hpContainer}>
        <Text style={styles.hpLabel}>{label}</Text>
        <View style={styles.hpTrack}>
          <View
            style={[
              styles.hpFill,
              {
                width: `${pct}%`,
                backgroundColor:
                  pct > 50 ? color : pct > 25 ? '#f59e0b' : '#ef4444',
              },
            ]}
          />
        </View>
        <Text style={[styles.hpText, { color }]}>
          {current}/{max}
        </Text>
      </View>
    );
  };

        if (phase === PHASE.INTRO) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.introEmoji}>🐉</Text>
        <Text style={styles.introTitle}>Dragon Slayer</Text>
        <Text style={styles.introSubtitle}>
          A fearsome dragon terrorizes the kingdom.{'\n'}Only you can stop it!
        </Text>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>⚔️ How to Play</Text>
          <View style={styles.instructionRow}>
            <Text style={styles.instructionEmoji}>📱💥</Text>
            <Text style={styles.instructionText}>
              <Text style={{ fontWeight: '700', color: '#fbbf24' }}>
                SHAKE{' '}
              </Text>
              your phone to punch the dragon!
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <Text style={styles.instructionEmoji}>📱🌀</Text>
            <Text style={styles.instructionText}>
              <Text style={{ fontWeight: '700', color: '#60a5fa' }}>
                TILT{' '}
              </Text>
              your phone to dodge dragon attacks!
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <Text style={styles.instructionEmoji}>🔥✨</Text>
            <Text style={styles.instructionText}>
              Build combos for bonus damage!
            </Text>
          </View>
        </View>

        {/* Sensor status */}
        <View style={styles.sensorStatusRow}>
          <View
            style={[
              styles.sensorBadge,
              {
                borderColor: accel.isActive
                  ? 'rgba(34,197,94,0.4)'
                  : 'rgba(239,68,68,0.3)',
              },
            ]}
          >
            <View
              style={[
                styles.sensorDot,
                {
                  backgroundColor: accel.isActive ? '#22c55e' : '#ef4444',
                },
              ]}
            />
            <Text style={styles.sensorLabel}>Accelerometer</Text>
          </View>
          <View
            style={[
              styles.sensorBadge,
              {
                borderColor: gyro.isActive
                  ? 'rgba(34,197,94,0.4)'
                  : 'rgba(239,68,68,0.3)',
              },
            ]}
          >
            <View
              style={[
                styles.sensorDot,
                {
                  backgroundColor: gyro.isActive ? '#22c55e' : '#ef4444',
                },
              ]}
            />
            <Text style={styles.sensorLabel}>Gyroscope</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.startBtn,
            !(accel.isActive && gyro.isActive) && styles.startBtnDisabled,
          ]}
          onPress={() => setPhase(PHASE.BATTLE)}
          disabled={!(accel.isActive && gyro.isActive)}
          activeOpacity={0.8}
        >
          <Text style={styles.startText}>
            {accel.isActive && gyro.isActive
              ? '⚔️  Enter Battle'
              : '⏳  Waiting for sensors…'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

        if (phase === PHASE.WIN || phase === PHASE.LOSE) {
    const won = phase === PHASE.WIN;
    return (
      <View style={styles.container}>
        <Text style={styles.endEmoji}>{won ? '🏆' : '💀'}</Text>
        <Text style={[styles.endTitle, { color: won ? '#fbbf24' : '#ef4444' }]}>
          {won ? 'VICTORY!' : 'DEFEATED'}
        </Text>
        <Text style={styles.endSubtitle}>
          {won
            ? 'The dragon has been slain!\nThe kingdom is saved!'
            : 'The dragon was too powerful…\nTry again, brave warrior!'}
        </Text>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Battle Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Punches</Text>
            <Text style={styles.statValue}>{totalPunches}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Best Combo</Text>
            <Text style={styles.statValue}>{combo}x</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>HP Remaining</Text>
            <Text style={styles.statValue}>
              {won ? `${playerHp}/${PLAYER_MAX_HP}` : '0'}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Dragon HP Left</Text>
            <Text style={styles.statValue}>
              {won ? '0' : `${dragonHp}/${DRAGON_MAX_HP}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={resetGame}>
          <Text style={styles.startText}>🔄  Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 12 }]}
          onPress={onBack}
        >
          <Text style={[styles.startText, { color: '#94a3b8' }]}>← Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

        return (
    <View style={styles.container}>
      {/* Dragon attacking overlay */}
      {dragonAttacking && <View style={styles.attackOverlay} />}

      {/* HP bars */}
      <View style={styles.hpSection}>
        <HpBar
          current={dragonHp}
          max={DRAGON_MAX_HP}
          color="#ef4444"
          label="🐉 Dragon"
        />
        <HpBar
          current={playerHp}
          max={PLAYER_MAX_HP}
          color="#22c55e"
          label="⚔️ You"
        />
      </View>

      {/* Combo counter */}
      {combo > 1 && (
        <View style={styles.comboBadge}>
          <Text style={styles.comboText}>🔥 {combo}x COMBO</Text>
        </View>
      )}

      {/* Dragon */}
      <Animated.View
        style={[
          styles.dragonArea,
          {
            transform: [
              { translateX: shakeAnim },
              { scale: dragonScale },
            ],
            opacity: dragonFlash.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.4],
            }),
          },
        ]}
      >
        <Text style={styles.dragonEmoji}>🐉</Text>
        {dragonAttacking && <Text style={styles.fireEmoji}>🔥🔥🔥</Text>}
      </Animated.View>

      {/* Floating message */}
      <Animated.View style={[styles.messageBox, { opacity: messageOpacity }]}>
        <Text style={styles.messageText}>{message}</Text>
      </Animated.View>

      {/* Warrior */}
      <Animated.View
        style={[
          styles.warriorArea,
          {
            opacity: playerFlash.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.3],
            }),
          },
        ]}
      >
        <Text style={styles.warriorEmoji}>🧙‍♂️</Text>
      </Animated.View>

      {/* Dodge indicator */}
      <View style={styles.dodgeIndicator}>
        {dragonAttacking ? (
          <Text style={styles.dodgeWarning}>🌀 TILT TO DODGE!</Text>
        ) : (
          <Text style={styles.dodgeReady}>📱 SHAKE TO PUNCH!</Text>
        )}
        {dodgeSuccess === true && (
          <Text style={styles.dodgeOk}>✅ Dodged!</Text>
        )}
        {dodgeSuccess === false && (
          <Text style={styles.dodgeFail}>❌ Hit!</Text>
        )}
      </View>

      {/* Sensor readings (small) */}
      <View style={styles.sensorMini}>
        <Text style={styles.sensorMiniText}>
          Accel: {accel.data ? Math.sqrt(accel.data.x ** 2 + accel.data.y ** 2 + accel.data.z ** 2).toFixed(1) : '–'}g
        </Text>
        <Text style={styles.sensorMiniText}>
          Gyro: {gyro.data ? Math.sqrt(gyro.data.x ** 2 + gyro.data.y ** 2 + gyro.data.z ** 2).toFixed(1) : '–'} r/s
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
    justifyContent: 'center',
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

    introEmoji: { fontSize: 80, marginBottom: 8 },
  introTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 2,
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  instructionCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  instructionEmoji: { fontSize: 22, width: 50 },
  instructionText: { flex: 1, color: '#cbd5e1', fontSize: 14, lineHeight: 20 },

  sensorStatusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  sensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  sensorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  sensorLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },

  startBtn: {
    width: '100%',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  startText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fbbf24',
  },

    attackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    zIndex: 0,
  },
  hpSection: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 20,
  },
  hpContainer: {
    marginBottom: 10,
  },
  hpLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  hpTrack: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 7,
    overflow: 'hidden',
  },
  hpFill: {
    height: 14,
    borderRadius: 7,
  },
  hpText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  comboBadge: {
    position: 'absolute',
    top: 140,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  comboText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '800',
  },

  dragonArea: {
    alignItems: 'center',
    marginTop: -40,
  },
  dragonEmoji: { fontSize: 100 },
  fireEmoji: { fontSize: 36, marginTop: -10 },

  messageBox: {
    marginVertical: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  messageText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  warriorArea: {
    alignItems: 'center',
  },
  warriorEmoji: { fontSize: 80 },

  dodgeIndicator: {
    marginTop: 16,
    alignItems: 'center',
  },
  dodgeWarning: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  dodgeReady: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  dodgeOk: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  dodgeFail: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },

  sensorMini: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    gap: 20,
  },
  sensorMiniText: {
    color: '#475569',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

    endEmoji: { fontSize: 80, marginBottom: 12 },
  endTitle: { fontSize: 40, fontWeight: '900', letterSpacing: 3, marginBottom: 10 },
  endSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  statsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: { color: '#94a3b8', fontSize: 14 },
  statValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '700' },
});
