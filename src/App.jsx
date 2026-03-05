import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { CropDoctor } from './pages/CropDoctor';
import { Weather } from './pages/Weather';
import { Market } from './pages/Market';
import { Tools } from './pages/Tools';
import { Voice } from './pages/Voice';
import { Grow } from './pages/Grow';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { Walkthrough } from './pages/Walkthrough';
import { Link } from 'react-router-dom';
import { OfflineBanner } from './components/OfflineBanner';
import { Logo } from './components/Logo';
import './App.css';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', labelKey: 'navHome' },
  { to: '/crop-doctor', icon: '🔬', labelKey: 'navCropDoctor' },
  { to: '/weather', icon: '☁️', labelKey: 'navWeather' },
  { to: '/market', icon: '🛒', labelKey: 'navMarket' },
  { to: '/tools', icon: '🚜', labelKey: 'navTools' },
  { to: '/voice', icon: '🎙️', labelKey: 'navVoice' },
  { to: '/grow', icon: '🌾', labelKey: 'navGrow' },
];

export default function App() {
  const { hasOnboarded, hasSeenWalkthrough, t, lang, setLang, languageNames, largeText, setLargeText } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);

  if (!hasOnboarded) return <Onboarding />;
  if (!hasSeenWalkthrough) return <Walkthrough />;

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <OfflineBanner />
        <div className="app" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <header className="header">
          <div className="header-brand">
            <Logo variant="full" size={40} />
            <p className="tagline">{t('tagline')}</p>
          </div>
          <button
            className="lang-switcher"
            onClick={() => setShowLangPicker(!showLangPicker)}
            title="Change language"
          >
            🌐 {languageNames[lang] || 'En'}
          </button>
          {showLangPicker && (
            <div className="lang-picker-dropdown">
              <button
                className={largeText ? 'active' : ''}
                onClick={() => { setLargeText(!largeText); }}
              >
                👁️ {t('largeText') || 'Large text'}
              </button>
              {Object.entries(languageNames).map(([code, name]) => (
                <button
                  key={code}
                  className={lang === code ? 'active' : ''}
                  onClick={() => { setLang(code); setShowLangPicker(false); }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crop-doctor" element={<CropDoctor />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/market" element={<Market />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/voice" element={<Voice />} />
            <Route path="/grow" element={<Grow />} />
          </Routes>
        </main>

        <Link to="/voice" className="help-fab" title={t('navVoice')}>
          🎙️
        </Link>

        <nav className="bottom-nav">
          {NAV_ITEMS.map(({ to, icon, labelKey }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">{icon}</span>
              <span>{t(labelKey) || labelKey}</span>
            </NavLink>
          ))}
        </nav>
        </div>
      </div>
    </BrowserRouter>
  );
}
