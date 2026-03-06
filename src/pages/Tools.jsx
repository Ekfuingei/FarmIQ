import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { API_BASE } from '../api';
import { Seo } from '../components/Seo';
import './Tools.css';

export function Tools() {
  const { t } = useLanguage();
  const EQUIPMENT_TYPES = [
    { value: '', label: t('all') },
    { value: 'tractor', label: `🚜 ${t('tractor')}` },
    { value: 'sprayer', label: `🧴 ${t('sprayer')}` },
    { value: 'harvester', label: `🌾 ${t('harvester')}` },
    { value: 'irrigation pump', label: `💧 ${t('irrigationPump')}` },
  ];
  const [equipment, setEquipment] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('browse'); // browse | list | booking
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState({ farmerName: '', farmerPhone: '', durationHours: 4, durationDays: 0 });
  const [listing, setListing] = useState({ type: 'tractor', name: '', owner: '', ownerPhone: '', country: 'Nigeria', ratePerHour: '', ratePerDay: '' });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [rating, setRating] = useState({ stars: 5, review: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) params.set('type', filter);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          params.set('lat', p.coords.latitude);
          params.set('lng', p.coords.longitude);
          fetch(`${API_BASE}/api/tools?${params}`).then(r => r.json()).then(d => setEquipment(d.equipment || [])).finally(() => setLoading(false));
        },
        () => fetch(`${API_BASE}/api/tools?${params}`).then(r => r.json()).then(d => setEquipment(d.equipment || [])).finally(() => setLoading(false))
      );
    } else {
      fetch(`${API_BASE}/api/tools?${params}`).then(r => r.json()).then(d => setEquipment(d.equipment || [])).finally(() => setLoading(false));
    }
  }, [filter]);

  const handleBook = async () => {
    if (!selected) return;
    setSubmitStatus('Sending...');
    try {
      const res = await fetch(`${API_BASE}/api/tools/${selected.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: booking.farmerName,
          farmerPhone: booking.farmerPhone,
          durationHours: booking.durationDays ? booking.durationDays * 8 : booking.durationHours,
          durationDays: booking.durationDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setSubmitStatus('Booking sent! Owner will contact you.');
      setTimeout(() => {
        setView('browse');
        setSelected(null);
        setSubmitStatus(null);
      }, 2500);
    } catch (err) {
      setSubmitStatus('Error: ' + err.message);
    }
  };

  const handleList = async () => {
    if (!listing.name || !listing.owner || !listing.ownerPhone || !listing.ratePerHour || !listing.ratePerDay) {
      setSubmitStatus('Fill all required fields.');
      return;
    }
    setSubmitStatus('Adding...');
    try {
      const res = await fetch(`${API_BASE}/api/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...listing,
          lat: 0, lng: 0, // Demo — add real GPS when available
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSubmitStatus('Equipment listed! It will appear in browse.');
      setListing({ type: 'tractor', name: '', owner: '', ownerPhone: '', country: 'Nigeria', ratePerHour: '', ratePerDay: '' });
      setEquipment(prev => [...prev, data]);
      setTimeout(() => {
        setView('browse');
        setSubmitStatus(null);
      }, 2000);
    } catch (err) {
      setSubmitStatus('Error: ' + err.message);
    }
  };

  const submitRating = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${API_BASE}/api/tools/${selected.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: rating.stars, review: rating.review }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitStatus('Thanks for your rating!');
      setEquipment(prev => prev.map(e => e.id === selected.id ? { ...e, rating: data.rating, reviews: data.reviews } : e));
      setSelected(prev => prev ? { ...prev, rating: data.rating, reviews: data.reviews } : null);
    } catch {
      setSubmitStatus('Could not submit rating.');
    }
  };

  const cost = selected
    ? (booking.durationDays ? selected.ratePerDay * booking.durationDays : selected.ratePerHour * (booking.durationHours || 1))
    : 0;

  return (
    <div className="tools-page">
      <Seo
        title="Tool & Equipment Sharing"
        description="Rent tractors, sprayers, harvesters & irrigation pumps. Hello Tractor style sharing for African farmers. Book by hour or day. No signup needed."
        path="/tools"
      />
      <h2>🚜 {t('toolsTitle')}</h2>
      <p className="subtitle">{t('toolsSubtitle')}</p>

      <div className="tools-tabs">
        <button className={view === 'browse' ? 'active' : ''} onClick={() => setView('browse')}>{t('browse')}</button>
        <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>{t('listYours')}</button>
      </div>

      {view === 'browse' && (
        <>
          <div className="filter-row">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="loading">Loading equipment...</p>
          ) : selected ? (
            <div className="booking-panel">
              <h3>{t('book')}: {selected.name}</h3>
              <p className="owner">{selected.owner} • {selected.country}</p>
              <p className="rating">⭐ {selected.rating} ({selected.reviews})</p>
              <p className="rate">{selected.currency || 'NGN'}{selected.ratePerHour?.toLocaleString()}/hr or {selected.currency || 'NGN'}{selected.ratePerDay?.toLocaleString()}/day</p>
              <div className="form-group">
                <label>{t('yourName')}</label>
                <input value={booking.farmerName} onChange={(e) => setBooking({ ...booking, farmerName: e.target.value })} placeholder="Name" />
              </div>
              <div className="form-group">
                <label>{t('phone')}</label>
                <input value={booking.farmerPhone} onChange={(e) => setBooking({ ...booking, farmerPhone: e.target.value })} placeholder="+234..." type="tel" />
              </div>
              <div className="form-group">
                <label>{t('hoursOrDays')}</label>
                <div className="duration-row">
                  <input type="number" min="1" value={booking.durationHours} onChange={(e) => setBooking({ ...booking, durationHours: +e.target.value, durationDays: 0 })} />
                  <span>hours</span>
                  <span>or</span>
                  <input type="number" min="0" value={booking.durationDays} onChange={(e) => setBooking({ ...booking, durationDays: +e.target.value, durationHours: 0 })} />
                  <span>days</span>
                </div>
              </div>
              <p className="cost">{t('estCost')}: {selected.currency || 'NGN'}{cost.toLocaleString()}</p>
              <a href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer" className="gps-link">📍 {t('viewOnMap')}</a>
              <div className="rate-section">
                <label>{t('rateOwner')}</label>
                <div className="stars-row">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" className={`star ${rating.stars >= s ? 'active' : ''}`} onClick={() => setRating(r => ({ ...r, stars: s }))}>★</button>
                  ))}
                </div>
                <input value={rating.review} onChange={(e) => setRating(r => ({ ...r, review: e.target.value }))} placeholder="Optional review" className="review-input" />
                <button type="button" onClick={submitRating} className="btn-secondary btn-sm">{t('submitRating')}</button>
              </div>
              <div className="booking-actions">
                <button onClick={() => setSelected(null)} className="btn-secondary">←</button>
                <button onClick={handleBook} className="btn-primary" disabled={!!submitStatus}>
                  {submitStatus || t('requestBooking')}
                </button>
              </div>
            </div>
          ) : (
            <div className="equipment-grid">
              {equipment.map((e) => (
                <div key={e.id} className="equipment-card">
                  <span className="type-icon">
                    {e.type === 'tractor' && '🚜'}
                    {e.type === 'sprayer' && '🧴'}
                    {e.type === 'harvester' && '🌾'}
                    {e.type === 'irrigation pump' && '💧'}
                  </span>
                  <h3>{e.name}</h3>
                  <p className="owner">{e.owner} • {e.country}</p>
                  <p className="rating">⭐ {e.rating} ({e.reviews} reviews)</p>
                  <p className="rate">{e.currency || 'NGN'}{e.ratePerHour?.toLocaleString()}/hr • {e.currency || 'NGN'}{e.ratePerDay?.toLocaleString()}/day</p>
                  {e.distance != null && <p className="distance">~{e.distance} km</p>}
                  <button onClick={() => setSelected(e)} className="btn-primary">{t('book')}</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'list' && (
        <div className="list-panel">
          <h3>{t('listEquipment')}</h3>
          <div className="form-group">
            <label>{t('equipmentType')}</label>
            <select value={listing.type} onChange={(e) => setListing({ ...listing, type: e.target.value })}>
              {EQUIPMENT_TYPES.filter(t => t.value).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('equipmentName')}</label>
            <input value={listing.name} onChange={(e) => setListing({ ...listing, name: e.target.value })} placeholder="e.g. John Deere 5055E" />
          </div>
          <div className="form-group">
            <label>{t('yourFarm')}</label>
            <input value={listing.owner} onChange={(e) => setListing({ ...listing, owner: e.target.value })} placeholder="Ibrahim Farms" />
          </div>
          <div className="form-group">
            <label>{t('phone')}</label>
            <input value={listing.ownerPhone} onChange={(e) => setListing({ ...listing, ownerPhone: e.target.value })} placeholder="+234..." type="tel" />
          </div>
          <div className="form-group">
            <label>{t('country')}</label>
            <select value={listing.country} onChange={(e) => setListing({ ...listing, country: e.target.value })}>
              <option>Nigeria</option>
              <option>Kenya</option>
              <option>Ghana</option>
              <option>Tanzania</option>
              <option>Cameroon</option>
              <option>South Africa</option>
              <option>Egypt</option>
              <option>Morocco</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('ratePerHour')}</label>
              <input type="number" value={listing.ratePerHour} onChange={(e) => setListing({ ...listing, ratePerHour: e.target.value })} placeholder="15000" />
            </div>
            <div className="form-group">
              <label>{t('ratePerDay')}</label>
              <input type="number" value={listing.ratePerDay} onChange={(e) => setListing({ ...listing, ratePerDay: e.target.value })} placeholder="95000" />
            </div>
          </div>
          {submitStatus && <p className="submit-status">{submitStatus}</p>}
          <button onClick={handleList} className="btn-primary">{t('listEquipmentBtn')}</button>
        </div>
      )}
    </div>
  );
}
