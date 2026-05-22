// Default sensor update interval in milliseconds.
// Lower values give faster updates but consume more battery.
export const DEFAULT_INTERVAL_MS = 100;

// Threshold for detecting a "punch" via accelerometer magnitude.
// Typical resting magnitude is ~1g (9.8 m/s²). A sharp shake exceeds this.
export const PUNCH_THRESHOLD = 1.8;

// Cooldown between registered punches (ms) to prevent multi-fire.
export const PUNCH_COOLDOWN_MS = 400;

// Gyroscope tilt threshold (rad/s) for dodge detection.
export const DODGE_THRESHOLD = 2.0;

// Dodge cooldown (ms).
export const DODGE_COOLDOWN_MS = 600;
