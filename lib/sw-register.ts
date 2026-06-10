/**
 * Service Worker Registration Utility
 *
 * Registers the service worker for offline asset caching.
 * Should be called once from the root layout or a client component on app load.
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('Service worker updated and activated.');
          }
        });
      }
    });

    console.log('Service worker registered successfully.');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.ready.then((registration) => {
    return registration.unregister();
  });
}
