import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { API_BASE } from '../api';
import { Seo } from '../components/Seo';
import './Grow.css';

const TABS = ['planting', 'reminders', 'rotation', 'postharvest'];
const CROPS = ['maize', 'cassava', 'yam', 'rice', 'sorghum', 'beans', 'cowpea', 'millet', 'tomato'];

export function Grow() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('planting');
  const [lat, setLat] = useState(-1.29);
  const [lng, setLng] = useState(36.82);

  const tabLabels = {
    planting: 'Planting',
    reminders: 'Reminders',
    rotation: 'Rotation',
    postharvest: 'Post-Harvest',
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        setLat(p.coords.latitude);
        setLng(p.coords.longitude);
      }, () => {}, { timeout: 5000 });
    }
  }, []);

  return (
    <div className="grow-page">
      <Seo
        title="Grow & Yield"
        description="Planting calendar, crop care reminders, rotation tips & post-harvest storage for maize, cassava, yam, beans & more. Plan your farming season."
        path="/grow"
      />
      <h2>🌾 {t('growTitle') || 'Grow & Yield'}</h2>
      <p className="subtitle">{t('growSubtitle') || 'Planting calendar, care reminders, crop rotation, post-harvest tips.'}</p>

      <div className="grow-tabs">
        {TABS.map((tId) => (
          <button key={tId} className={tab === tId ? 'active' : ''} onClick={() => setTab(tId)}>
            {t[`growTab${tId.charAt(0).toUpperCase() + tId.slice(1)}`] || tabLabels[tId]}
          </button>
        ))}
      </div>

      {tab === 'planting' && <PlantingCalendar lat={lat} lng={lng} />}
      {tab === 'reminders' && <CropReminders />}
      {tab === 'rotation' && <CropRotation />}
      {tab === 'postharvest' && <PostHarvestTips />}
    </div>
  );
}

function PlantingCalendar({ lat, lng }) {
  const { t } = useLanguage();
  const [crop, setCrop] = useState('maize');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/grow/planting-calendar?crop=${crop}&lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [crop, lat, lng]);

  if (!data) return <p className="loading">{t('loadingWeather') || 'Loading...'}</p>;

  const statusClass = data.status === 'now' ? 'now' : data.status === 'upcoming' ? 'upcoming' : 'passed';
  return (
    <div className="grow-section">
      <label>{t('growPlantingCrop') || 'Crop'}</label>
      <select value={crop} onChange={(e) => setCrop(e.target.value)}>
        {CROPS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
      </select>
      <div className={`calendar-card ${statusClass}`}>
        <h3>{t('growPlantingWindow') || 'Planting window'}: {data.window.startName} – {data.window.endName}</h3>
        <p className="status">{data.status === 'now' ? '✓ Good time to plant now' : data.status === 'upcoming' ? '⏳ Coming soon' : 'Next season'}</p>
        <p className="tip">{data.tip}</p>
      </div>
    </div>
  );
}

function CropReminders() {
  const { t } = useLanguage();
  const [plantings, setPlantings] = useState(() => JSON.parse(localStorage.getItem('farmiq_plantings') || '[]'));
  const [crop, setCrop] = useState('maize');
  const [date, setDate] = useState('');
  const [milestonesByCrop, setMilestonesByCrop] = useState({});

  useEffect(() => {
    const crops = [...new Set(plantings.map((p) => p.crop))];
    crops.forEach((c) => {
      fetch(`${API_BASE}/api/grow/care-milestones?crop=${c}`)
        .then((r) => r.json())
        .then((d) => setMilestonesByCrop((prev) => ({ ...prev, [c]: d.milestones || [] })));
    });
  }, [plantings]);

  const addPlanting = () => {
    if (!date) return;
    const p = { id: Date.now(), crop, date };
    const next = [...plantings, p];
    setPlantings(next);
    localStorage.setItem('farmiq_plantings', JSON.stringify(next));
    setDate('');
  };

  const removePlanting = (id) => {
    const next = plantings.filter((x) => x.id !== id);
    setPlantings(next);
    localStorage.setItem('farmiq_plantings', JSON.stringify(next));
  };

  const getUpcoming = () => {
    const today = new Date();
    const results = [];
    plantings.forEach((p) => {
      const milestones = milestonesByCrop[p.crop] || milestonesByCrop.maize || [];
      const planted = new Date(p.date);
      milestones.forEach((m) => {
        const due = new Date(planted);
        due.setDate(due.getDate() + m.day);
        if (due >= today && due <= new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)) {
          results.push({ ...p, ...m, due: due.toISOString().slice(0, 10) });
          results.sort((a, b) => new Date(a.due) - new Date(b.due));
        }
      });
    });
    return results;
  };

  const upcoming = getUpcoming();

  return (
    <div className="grow-section">
      <h3>{t('growAddPlanting') || 'Add planting'}</h3>
      <div className="add-form">
        <select value={crop} onChange={(e) => setCrop(e.target.value)}>
          {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={addPlanting} className="btn-primary">{t('growAdd') || 'Add'}</button>
      </div>

      {upcoming.length > 0 && (
        <div className="reminders-list">
          <h4>{t('growUpcomingReminders') || 'Upcoming care tasks'}</h4>
          {upcoming.slice(0, 5).map((r) => (
            <div key={`${r.id}-${r.day}`} className="reminder-card">
              <strong>{r.task}</strong> — {r.crop} ({r.due})
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      )}

      <div className="plantings-list">
        <h4>{t('growMyPlantings') || 'My plantings'}</h4>
        {plantings.length === 0 ? <p>{t('growNoPlantings') || 'Add a planting to get reminders.'}</p> : (
          plantings.map((p) => (
            <div key={p.id} className="planting-row">
              <span>{p.crop} — {p.date}</span>
              <button onClick={() => removePlanting(p.id)} className="btn-sm">×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CropRotation() {
  const { t } = useLanguage();
  const [after, setAfter] = useState('maize');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/grow/rotation?after=${after}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [after]);

  if (!data) return <p className="loading">...</p>;

  return (
    <div className="grow-section">
      <label>{t('growAfterHarvest') || 'After harvesting'}</label>
      <select value={after} onChange={(e) => setAfter(e.target.value)}>
        {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="rotation-card">
        <p className="tip">{data.tip}</p>
        <div className="suggested-crops">
          {data.suggested.map((c) => (
            <span key={c} className="crop-tag">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostHarvestTips() {
  const { t } = useLanguage();
  const [crop, setCrop] = useState('maize');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/grow/post-harvest?crop=${crop}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [crop]);

  if (!data) return <p className="loading">...</p>;

  return (
    <div className="grow-section">
      <label>{t('growStorageFor') || 'Storage tips for'}</label>
      <select value={crop} onChange={(e) => setCrop(e.target.value)}>
        {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="tips-card">
        <ul>
          {data.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
