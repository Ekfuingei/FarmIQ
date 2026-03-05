import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Logo } from '../components/Logo';
import './Walkthrough.css';

const SLIDES = [
  { icon: '📷', title: 'cropSlide1', desc: 'cropSlide1Desc' },
  { icon: '☁️', title: 'weatherSlide', desc: 'weatherSlideDesc' },
  { icon: '🎙️', title: 'voiceSlide', desc: 'voiceSlideDesc' },
  { icon: '🌾', title: 'growSlide', desc: 'growSlideDesc' },
];

export function Walkthrough() {
  const { t, completeWalkthrough } = useLanguage();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="walkthrough">
      <Logo variant="icon" size={48} className="walkthrough-brand" />
      <div className="walkthrough-slide">
        <div className="slide-icon">{slide.icon}</div>
        <h2>{t(slide.title) || slide.title}</h2>
        <p>{t(slide.desc) || slide.desc}</p>
      </div>
      <div className="walkthrough-dots">
        {SLIDES.map((_, i) => (
          <span key={i} className={`dot ${i === step ? 'active' : ''}`} />
        ))}
      </div>
      <div className="walkthrough-actions">
        <button
          className="btn-skip"
          onClick={completeWalkthrough}
        >
          {t('skip') || 'Skip'}
        </button>
        <button
          className="btn-next"
          onClick={() => (isLast ? completeWalkthrough() : setStep(step + 1))}
        >
          {isLast ? (t('getStarted') || 'Get started') : (t('next') || 'Next')}
        </button>
      </div>
    </div>
  );
}
