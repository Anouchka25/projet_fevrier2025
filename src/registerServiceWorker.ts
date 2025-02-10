export async function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // Enregistrer le Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker enregistré avec succès:', registration);

      // Demander la permission pour les notifications
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // S'abonner aux notifications push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'VOTRE_CLE_PUBLIQUE_VAPID'
        });

        // Envoyer l'abonnement au serveur
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription)
        });

        console.log('Abonnement aux notifications réussi');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    }
  }
}

// Fonction pour vérifier si l'application est installée
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}