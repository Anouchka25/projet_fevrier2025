const CACHE_NAME = 'kundapay-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
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
      );
    })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouveau transfert reçu',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
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
      tag: 'transfer-notification', // Pour regrouper les notifications
      renotify: true // Pour vibrer même si une notification existe déjà
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

// Gestion des erreurs de notification
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});