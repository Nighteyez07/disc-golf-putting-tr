/**
 * Haptic feedback utilities for mobile devices
 * Uses Vibration API (navigator.vibrate) when available
 */

// Vibration patterns (in milliseconds)
export const VIBRATION_PATTERNS = {
  SINK: [50] as const,                      // Single 50ms pulse (success feel)
  MISS: [30, 30, 30] as const,              // Two 30ms pulses with 30ms gap (gentle warning)
  PENALTY: [200, 100, 200] as const,        // Attention-grabbing pattern
} as const

// localStorage key for haptic preference
const HAPTIC_PREFERENCE_KEY = "haptic_feedback_enabled"

/**
 * Check if Vibration API is supported in the current browser
 */
export function isHapticsSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator
}

/**
 * Get the user's haptic preference from localStorage
 * Defaults to true if not set
 */
export function getHapticPreference(): boolean {
  try {
    const stored = localStorage.getItem(HAPTIC_PREFERENCE_KEY)
    if (stored === null) {
      return true // Default to enabled
    }
    return stored === "true"
  } catch (error) {
    console.warn("Failed to read haptic preference:", error)
    return true
  }
}

/**
 * Save the user's haptic preference to localStorage
 */
export function setHapticPreference(enabled: boolean): void {
  try {
    localStorage.setItem(HAPTIC_PREFERENCE_KEY, String(enabled))
  } catch (error) {
    console.warn("Failed to save haptic preference:", error)
  }
}

/**
 * Trigger haptic feedback with the specified pattern
 * Respects user preference and browser support
 */
export function triggerHaptic(pattern: readonly number[]): void {
  // Check if haptics are supported
  if (!isHapticsSupported()) {
    return
  }

  // Check user preference
  if (!getHapticPreference()) {
    return
  }

  try {
    // navigator.vibrate() accepts a single number or array
    navigator.vibrate(pattern as number[])
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug("Haptic feedback failed:", error)
  }
}

/**
 * Convenience functions for common haptic patterns
 */
export const haptics = {
  sink: () => triggerHaptic(VIBRATION_PATTERNS.SINK),
  miss: () => triggerHaptic(VIBRATION_PATTERNS.MISS),
  penalty: () => triggerHaptic(VIBRATION_PATTERNS.PENALTY),
} as const
