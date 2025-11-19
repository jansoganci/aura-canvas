// Haptic feedback utility for mobile devices

/**
 * Trigger device vibration
 * @param pattern - Duration in ms, or array of durations [vibrate, pause, vibrate, ...]
 */
export function vibrate(pattern: number | number[] = 50): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/**
 * Short tap feedback
 */
export function hapticTap(): void {
  vibrate(10);
}

/**
 * Medium feedback for selections
 */
export function hapticSelect(): void {
  vibrate(30);
}

/**
 * Strong feedback for important actions
 */
export function hapticSuccess(): void {
  vibrate([30, 50, 30]);
}

/**
 * Error feedback
 */
export function hapticError(): void {
  vibrate([50, 30, 50]);
}
