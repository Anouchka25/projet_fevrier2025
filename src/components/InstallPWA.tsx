import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const isAppInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !isAppInstalled() && isMobile) {
        setShowPrompt(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isAppInstalled() && isMobile) {
        setShowPrompt(true);
      }
    };

    const handlePageHide = () => {
      if (!isAppInstalled() && isMobile) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('Application installée avec succès');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
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

  // Don't show the prompt if not on mobile
  if (!isMobile || !showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 m-4"
      >
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-full p-1"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <img src="/KundaPay.svg" alt="KundaPay Logo" className="h-32 mx-auto mb-4" />
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Installez KundaPay sur votre appareil
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            Accédez rapidement à vos transferts et profitez d'une meilleure expérience en installant notre application.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleInstall}
              className="w-full bg-yellow-600 text-white rounded-lg py-3 px-4 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Installer maintenant
            </button>
            
            <button
              onClick={() => setShowPrompt(false)}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Plus tard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstallPWA;