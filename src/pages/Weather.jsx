import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Seo } from '../components/Seo';
import './Weather.css';

// Default: Nairobi — replaced by user's location when available
const DEFAULT_LAT = -1.2921;
const DEFAULT_LNG = 36.8219;

const WMO_CODES = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Drizzle',
  61: 'Rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  80: 'Showers',
  95: 'Thunderstorm',
};

export function Weather() {
  const { t, lang } = useLanguage();
  const [forecast, setForecast] = useState(null);
  const [plantingTip, setPlantingTip] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let lat = DEFAULT_LAT, lng = DEFAULT_LNG;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          setLocation({ lat, lng });
        },
        () => {},
        { timeout: 5000 }
      );
    }
    const fetchWeather = async () => {
      try {
        const [fRes, tRes, aRes] = await Promise.all([
          fetch(`/api/weather/forecast?lat=${lat}&lng=${lng}`),
          fetch(`/api/weather/planting-tip?lat=${lat}&lng=${lng}`),
          fetch(`/api/weather/alerts?lat=${lat}&lng=${lng}`),
        ]);
        const f = await fRes.json();
        const tipData = await tRes.json();
        const a = await aRes.json();
        setForecast(f);
        setPlantingTip(tipData.tip);
        setAlerts(a.alerts || []);
      } catch {
        setPlantingTip('Check local weather before planting.');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // Refetch when user's location is obtained
  useEffect(() => {
    if (!location) return;
    (async () => {
      try {
        const [fRes, tRes, aRes] = await Promise.all([
          fetch(`/api/weather/forecast?lat=${location.lat}&lng=${location.lng}`),
          fetch(`/api/weather/planting-tip?lat=${location.lat}&lng=${location.lng}`),
          fetch(`/api/weather/alerts?lat=${location.lat}&lng=${location.lng}`),
        ]);
        const f = await fRes.json();
        const tipData = await tRes.json();
        const a = await aRes.json();
        setForecast(f);
        setPlantingTip(tipData.tip);
        setAlerts(a.alerts || []);
      } catch {}
    })();
  }, [location]);

  if (loading) return <div className="weather loading">{t('loadingWeather')}</div>;

  const daily = forecast?.daily;
  const days = daily?.time?.slice(0, 7) || [];

  const localeMap = { en: 'en', ha: 'ha', yo: 'yo', ig: 'ig', pcm: 'en-NG', fr: 'fr', ar: 'ar', sw: 'sw' };

  return (
    <div className="weather">
      <Seo
        title="Weather Forecast"
        description="7-day weather forecast, planting tips & alerts for African farmers. Know when to plant, when to spray, and when heavy rain or heat is coming."
        path="/weather"
      />
      <h2>☁️ {t('weatherTitle')}</h2>
      <p className="subtitle">{location ? t('yourLocation') : t('defaultLocation')} • {t('weatherSubtitle')}</p>

      {plantingTip && (
        <div className="planting-tip">
          <strong>🌱 {t('plantingTip')}</strong>
          <p>{plantingTip}</p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="weather-alerts">
          <strong>⚠️ {t('weatherAlerts') || 'Alerts'}</strong>
          {alerts.map((a, i) => (
            <div key={i} className={`alert alert-${a.type}`}>
              {a.msg}
            </div>
          ))}
        </div>
      )}

      <div className="forecast-grid">
        {days.map((date, i) => (
          <div key={date} className="day-card">
            <p className="day-name">
              {i === 0 ? t('today') : new Date(date).toLocaleDateString(localeMap[lang] || 'en', { weekday: 'short' })}
            </p>
            <p className="temp">{Math.round(daily?.temperature_2m_max?.[i])}° / {Math.round(daily?.temperature_2m_min?.[i])}°</p>
            <p className="desc">{WMO_CODES[daily?.weathercode?.[i]] ?? '—'}</p>
            <p className="rain">🌧 {daily?.precipitation_sum?.[i] ?? 0} mm</p>
          </div>
        ))}
      </div>
    </div>
  );
}
