import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Seo } from '../components/Seo';
import './Voice.css';

const LANGUAGES = [
  { code: 'ha', name: 'Hausa', srLang: 'ha-NG' },
  { code: 'yo', name: 'Yoruba', srLang: 'yo' },
  { code: 'ig', name: 'Igbo', srLang: 'ig' },
  { code: 'pcm', name: 'Pidgin', srLang: 'en-NG' },
  { code: 'fr', name: 'French', srLang: 'fr-FR' },
  { code: 'ar', name: 'Arabic', srLang: 'ar' },
  { code: 'sw', name: 'Swahili', srLang: 'sw' },
  { code: 'en', name: 'English', srLang: 'en' },
];

export function Voice() {
  const { t, tWithParams } = useLanguage();
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input not supported. Use Chrome or Edge.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setListening(false);
      if (e.error !== 'no-speech') setError(e.error);
    };
    recognitionRef.current = rec;
    return () => rec?.abort();
  }, []);

  const startListening = () => {
    setError(null);
    setTranscript('');
    setAnswer('');
    const rec = recognitionRef.current;
    if (!rec) return;
    rec.lang = language.srLang;
    rec.start();
    setListening(true);
  };

  const askGemini = async () => {
    const q = transcript.trim();
    if (!q) {
      setError('Tap the mic and speak, or type your question.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/voice/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, language: language.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAnswer(data.answer);
      speak(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (!text) return;
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = language.code === 'pcm' ? 'en-NG' : language.code;
    ut.rate = 0.9;
    setSpeaking(true);
    ut.onend = () => setSpeaking(false);
    speechSynthesis.speak(ut);
  };

  return (
    <div className="voice-page">
      <Seo
        title="Voice Assistant"
        description="Ask FarmIQ by voice. Speak your farming question in Hausa, Yoruba, Igbo, Pidgin, French, Arabic, Swahili or English. Get spoken answers. No typing needed."
        path="/voice"
      />
      <h2>🎙️ {t('voiceTitle')}</h2>
      <p className="subtitle">{t('voiceSubtitle')}</p>

      <div className="lang-select">
        <label>{t('language')}</label>
        <select value={language.code} onChange={(e) => setLanguage(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="mic-section">
        <button
          className={`mic-btn ${listening ? 'listening' : ''}`}
          onClick={startListening}
          disabled={loading}
          title={t('tapToSpeak')}
        >
          {listening ? `🔴 ${t('listening')}` : `🎤 ${t('tapToSpeak')}`}
        </button>
        <p className="hint">{tWithParams('speakIn', { lang: language.name })}</p>
      </div>

      {transcript && (
        <div className="transcript-box">
          <strong>{t('youSaid')}</strong>
          <p>{transcript}</p>
          <button onClick={askGemini} disabled={loading} className="btn-primary">
            {loading ? t('thinking') : t('askFarmIQ')}
          </button>
        </div>
      )}

      <div className="type-fallback">
        <label>{t('orType')}</label>
        <input
          type="text"
          placeholder="e.g. When should I plant maize?"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
      </div>

      {answer && (
        <div className="answer-box">
          <strong>{t('farmIQSays')}</strong>
          <p>{answer}</p>
          <button
            onClick={() => speak(answer)}
            disabled={speaking}
            className="btn-secondary"
          >
            {speaking ? `🔊 ${t('playing')}` : `🔊 ${t('playAgain')}`}
          </button>
        </div>
      )}
    </div>
  );
}
