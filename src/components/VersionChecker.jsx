import { useState, useEffect, useCallback, useRef } from 'react';
import { HiRefresh, HiSparkles, HiX } from 'react-icons/hi';

// Only run version checking in production
const IS_PRODUCTION = import.meta.env.PROD;
const BUILD_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null;
const CHECK_INTERVAL = 15 * 1000; // Check every 15 seconds
const STORAGE_KEY = 'forbasi_dismissed_version';

export default function VersionChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState(null);
  const [isReloading, setIsReloading] = useState(false);
  const intervalRef = useRef(null);

  const checkVersion = useCallback(async () => {
    if (!IS_PRODUCTION || !BUILD_VERSION) return;
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (!res.ok) return;
      const data = await res.json();

      // Version matches — user is on latest, nothing to do
      if (!data.version || data.version === BUILD_VERSION) {
        setUpdateAvailable(false);
        setNewVersion(null);
        return;
      }

      // New version detected — check if user already dismissed THIS specific new version
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed === data.version) {
        // User already dismissed this version, don't show again
        return;
      }

      // Show update banner
      setNewVersion(data.version);
      setUpdateAvailable(true);
    } catch {
      // Silently fail — don't show errors for version checks
    }
  }, []);

  useEffect(() => {
    // Check immediately on mount (no delay)
    checkVersion();
    // Then check every 15 seconds
    intervalRef.current = setInterval(checkVersion, CHECK_INTERVAL);

    // Also check when tab becomes visible or gets focus
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkVersion();
    };
    const onFocus = () => checkVersion();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkVersion]);

  const forceHardReload = () => {
    setIsReloading(true);
    localStorage.removeItem(STORAGE_KEY);
    // Simple reload — browser already has most assets cached via content-hash filenames
    window.location.reload();
  };

  const handleDismiss = () => {
    // Dismiss THIS specific new version — won't show again until a DIFFERENT new version is deployed
    if (newVersion) {
      try {
        localStorage.setItem(STORAGE_KEY, newVersion);
      } catch { /* ignore */ }
    }
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-3 sm:p-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-2xl shadow-green-900/30 border border-green-500/30 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <HiSparkles className="text-white" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm sm:text-base">Versi Baru Tersedia!</h4>
            <p className="text-green-100 text-xs sm:text-sm mt-0.5 leading-relaxed">
              Aplikasi telah diperbarui. Muat ulang untuk mendapatkan fitur & perbaikan terbaru.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={forceHardReload} disabled={isReloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-green-50 transition-colors shadow-lg disabled:opacity-70">
                <HiRefresh size={16} className={isReloading ? 'animate-spin' : ''} />
                {isReloading ? 'Memuat ulang...' : 'Perbarui Sekarang'}
              </button>
              {!isReloading && (
                <button onClick={handleDismiss}
                  className="px-3 py-2 text-green-100 hover:text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors">
                  Nanti
                </button>
              )}
            </div>
          </div>
          {!isReloading && (
            <button onClick={handleDismiss}
              className="p-1.5 hover:bg-white/10 rounded-lg text-green-200 hover:text-white transition-colors shrink-0">
              <HiX size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
