import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { Logo } from '../components/Logo';
import { Seo } from '../components/Seo';
import { StructuredData } from '../components/StructuredData';
import './Home.css';

export function Home() {
  const { t } = useLanguage();
  const features = [
    { icon: '🔬', title: t('featureCropDoctor'), desc: t('featureCropDoctorDesc'), to: '/crop-doctor' },
    { icon: '☁️', title: t('featureWeather'), desc: t('featureWeatherDesc'), to: '/weather' },
    { icon: '🛒', title: t('featureMarket'), desc: t('featureMarketDesc'), to: '/market' },
    { icon: '🚜', title: t('featureTools'), desc: t('featureToolsDesc'), to: '/tools' },
    { icon: '🎙️', title: t('featureVoice'), desc: t('featureVoiceDesc'), to: '/voice' },
    { icon: '🌾', title: t('featureGrow') || 'Grow & Yield', desc: t('featureGrowDesc') || 'Planting calendar, reminders, rotation', to: '/grow' },
  ];

  return (
    <>
      <Seo
        title="FarmIQ — Your Farming Super-App"
        description="AI Crop Doctor, weather forecast, market prices & tool sharing for African farmers. Free. Works in Hausa, Yoruba, Igbo, Pidgin, French, Arabic, Swahili & English."
        path="/"
      />
      <StructuredData />
    <div className="home">
      <div className="hero">
        <Logo variant="icon" size={48} className="hero-brand" />
        <h2>{t('homeWelcome')}</h2>
        <p>{t('homeSubtitle')}</p>
      </div>

      <div className="feature-grid">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="feature-card">
            <span className="icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
