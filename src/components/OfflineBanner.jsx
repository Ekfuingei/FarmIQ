import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import './OfflineBanner.css';

export function OfflineBanner() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner">
      <span className="offline-icon">📡</span>
      <span>{t('offlineMsg') || 'No internet. Some features may not work.'}</span>
      <button
        className="offline-retry"
        onClick={() => window.location.reload()}
      >
        {t('retry') || 'Retry'}
      </button>
    </div>
  );
}
