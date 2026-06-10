'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/sw-register';

/**
 * Client component that registers the service worker on mount.
 * Renders nothing — purely a side-effect component.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
