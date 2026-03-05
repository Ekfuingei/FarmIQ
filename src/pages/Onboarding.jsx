import { useLanguage } from '../LanguageContext';
import { Logo } from '../components/Logo';
import './Onboarding.css';

const LANG_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'pcm', name: 'Pidgin', flag: '🇳🇬' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
];

export function Onboarding() {
  const { completeOnboarding, t } = useLanguage();

  return (
    <div className="onboarding">
      <div className="onboarding-content">
        <Logo variant="full" className="onboarding-logo" />
        <h2>{t('onboardingWelcome')}</h2>
        <p className="onboarding-subtitle">{t('onboardingSubtitle')}</p>

        <div className="language-grid">
          {LANG_OPTIONS.map(({ code, name, flag }) => (
            <button
              key={code}
              className="lang-btn"
              onClick={() => completeOnboarding(code)}
            >
              <span className="lang-flag">{flag}</span>
              <span className="lang-name">{name}</span>
            </button>
          ))}
        </div>

        <p className="onboarding-note">
          {t('onboardingNote')}
        </p>
      </div>
    </div>
  );
}
