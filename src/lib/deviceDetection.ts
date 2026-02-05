/**
 * Device detection utilities for performance optimizations
 */

/**
 * Checks if the current device is mobile based on screen width
 * Uses 768px as the breakpoint (matches Tailwind's md: breakpoint)
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Checks if the device supports touch events
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Combined check for mobile and touch support
 * More accurate for detecting phones/tablets
 */
export const isMobileWithTouch = (): boolean => {
  return isMobileDevice() && isTouchDevice();
};
