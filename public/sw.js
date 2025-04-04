const CACHE_NAME = 'kundapay-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/KundaPay.png',
  '/KundaPay.svg',
  '/KundaPay2.svg'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  // Force l'activation immédiate
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        // Prendre le contrôle immédiatement
        clients.claim();
        // Notifier tous les clients qu'une mise à jour est disponible
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'UPDATE_AVAILABLE'
            });
          });
        });
      });
    })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouveau transfert reçu',
      icon: '/KundaPay.png',
      badge: '/favicon.png',
      vibrate: [100, 50, 100],
      data: {
        transferId: data.transferId,
        url: data.url || '/dashboard'
      },
      actions: [
        {
          action: 'view',
          title: 'Voir le transfert'
        }
      ],
      tag: 'transfer-notification',
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'KundaPay', options)
    );
  } catch (error) {
    console.error('Erreur lors du traitement de la notification:', error);
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Gestion du fetch pour le mode hors ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});