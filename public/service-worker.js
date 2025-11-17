/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'printo-cache-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/Logo.jpeg'];

const DB_NAME = 'printo-offline';
const STORE_NAME = 'pendingExpenses';

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const getAllPending = async () => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

const removePending = async (id) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || caches.match(request))
        )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const syncExpenses = async () => {
  const pending = await getAllPending();
  if (!pending.length) {
    return;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const entry of pending) {
    try {
      const baseUrl =
        entry.apiUrl ||
        (self.location.origin.includes('localhost')
          ? 'http://localhost:5000/api'
          : `${self.location.origin}/api`);

      const formData = new FormData();
      formData.append('category', entry.expense.category);
      formData.append('amount', entry.expense.amount);
      formData.append('date', entry.expense.date);
      formData.append('location', entry.expense.location || '');
      formData.append('note', entry.expense.note || '');

      if (entry.imageBase64) {
        const blob = await dataUrlToBlob(entry.imageBase64);
        formData.append('image', blob, `receipt-${Date.now()}.png`);
      }

      await fetch(`${baseUrl}/expenses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${entry.token}`,
        },
        body: formData,
      });

      await removePending(entry.id);
    } catch (error) {
      console.error('Background sync failed for expense', entry.id, error);
    }
  }
};

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'sync-expenses') {
    syncExpenses();
  }
});

