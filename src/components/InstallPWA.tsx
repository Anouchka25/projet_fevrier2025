import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Déclencher le prompt d'installation
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Application installée avec succès');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <img src="/KundaPay2.svg" alt="KundaPay Logo" className="h-16 mx-auto mb-4" />
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Installez KundaPay sur votre appareil
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            Accédez rapidement à vos transferts et profitez d'une meilleure expérience en installant notre application.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleInstall}
              className="w-full bg-yellow-600 text-white rounded-md py-2 px-4 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Installer maintenant
            </button>
            
            <button
              onClick={() => setShowPrompt(false)}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;