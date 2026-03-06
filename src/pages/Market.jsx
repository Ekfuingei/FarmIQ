import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { API_BASE } from '../api';
import { Seo } from '../components/Seo';
import './Market.css';

export function Market() {
  const { t } = useLanguage();
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/market/prices`)
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets || []))
      .catch(() => setMarkets([]));
  }, []);

  return (
    <div className="market">
      <Seo
        title="Market Prices"
        description="Live market prices for maize, yam, cassava, tomato & more across Nigeria, Kenya, Ghana, Tanzania & Africa. Find the best market to sell today."
        path="/market"
      />
      <h2>🛒 {t('marketTitle')}</h2>
      <p className="subtitle">{t('marketSubtitle')}</p>

      <div className="market-list">
        {markets.map((m, i) => (
          <div key={i} className="market-card">
            <div className="market-header">
              <h3>{m.name}</h3>
              <span className={`trend ${m.trend}`}>{m.trend}</span>
            </div>
            <p className="crop">{m.crop} <span className="country">• {m.country || 'Nigeria'}</span></p>
            <p className="price">{m.currency || 'NGN'}{m.price?.toLocaleString()}<span>/{m.unit}</span></p>
          </div>
        ))}
      </div>
      <p className="note">{t('marketNote')}</p>
    </div>
  );
}
