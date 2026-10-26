/**
 * DAMVERSE - Android Haptic Vibration Feedback Utility
 * Uses the Web Vibration API for tactile response on Android devices.
 */

export function triggerHaptic(pattern: number | number[] = 15) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if device does not support vibration
    }
  }
}
