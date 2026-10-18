import { router } from 'expo-router';

/**
 * Global Navigation Debouncer
 * 
 * Intercepts expo-router's singleton methods (`push`, `navigate`, `replace`)
 * to prevent instant multiple clicks / rapid double-taps from navigating multiple times
 * anywhere in the app (current screens and all future screens).
 * 
 * Debounce window: 600ms (sufficient to ignore multi-taps while keeping normal user navigation instantaneous).
 */

const DEBOUNCE_DELAY_MS = 600;
let lastNavigationTimestamp = 0;
let lastTargetRoute = '';

const originalPush = router.push.bind(router);
const originalNavigate = router.navigate.bind(router);
const originalReplace = router.replace.bind(router);

function shouldThrottle(target: any): boolean {
  const now = Date.now();
  const routeKey = typeof target === 'string' ? target : JSON.stringify(target);
  
  // If user tapped again within DEBOUNCE_DELAY_MS to the same target route, throttle it
  if (now - lastNavigationTimestamp < DEBOUNCE_DELAY_MS && routeKey === lastTargetRoute) {
    return true;
  }
  
  lastNavigationTimestamp = now;
  lastTargetRoute = routeKey;
  return false;
}

router.push = ((...args: Parameters<typeof originalPush>) => {
  if (shouldThrottle(args[0])) {
    return;
  }
  return originalPush(...args);
}) as typeof originalPush;

router.navigate = ((...args: Parameters<typeof originalNavigate>) => {
  if (shouldThrottle(args[0])) {
    return;
  }
  return originalNavigate(...args);
}) as typeof originalNavigate;

router.replace = ((...args: Parameters<typeof originalReplace>) => {
  if (shouldThrottle(args[0])) {
    return;
  }
  return originalReplace(...args);
}) as typeof originalReplace;
