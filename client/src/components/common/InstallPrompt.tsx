import React, { useState, useEffect } from 'react';
import { HardHat, X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before (respect their choice for 7 days)
    const dismissed = localStorage.getItem('coolink_pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // iOS detection (Safari doesn't support beforeinstallprompt)
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
    const isInSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIosDevice && isInSafari && !isStandalone) {
      setIsIos(true);
      setShowBanner(true);
      return;
    }

    // Android Chrome / other browsers that support beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('coolink_pwa_dismissed', Date.now().toString());
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-3 pb-safe"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-start p-4 space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <HardHat className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-slate-900 text-sm">Install CooLink App</p>
            {isIos ? (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Tap <strong>Share</strong> <span className="text-brand-600">⎙</span> then{' '}
                <strong>"Add to Home Screen"</strong> to install for free. Works offline!
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Add to your home screen for fast 1-tap access. Works offline. No Play Store needed.
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isIos && (
          <div className="px-4 pb-4 pt-0">
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Install Free App</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
