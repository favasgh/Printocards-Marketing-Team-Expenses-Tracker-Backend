const SERVICE_WORKER_FILE = '/service-worker.js';

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser');
    return;
  }

  // Register service worker (works in both dev and production)
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_FILE)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available');
                // Optionally show update notification to user
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  });

  // Handle service worker updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      // Optionally reload the page to use new service worker
      // window.location.reload();
    }
  });
};

export const requestBackgroundSync = async (tag = 'sync-expenses') => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  try {
    if ('sync' in registration && 'SyncManager' in window) {
      await registration.sync.register(tag);
    } else if (registration.active) {
      registration.active.postMessage(tag);
    }
  } catch (error) {
    console.error('Failed to register background sync', error);
    if (registration.active) {
      registration.active.postMessage(tag);
    }
  }
};

