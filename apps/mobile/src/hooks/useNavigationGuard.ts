import { useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';

/**
 * Prevents double-navigation on fast taps.
 * Blocks any further navigation for 1000ms after the first call.
 */
export function useNavigationGuard() {
  const router = useRouter();
  const isNavigating = useRef(false);

  const navigate = useCallback((href: string) => {
    if (isNavigating.current) {
      return;
    }
    isNavigating.current = true;
    router.push(href as any);
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [router]);

  return { navigate };
}
