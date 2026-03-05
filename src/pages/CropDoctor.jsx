import { useState, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { Seo } from '../components/Seo';
import './CropDoctor.css';

const MAIN_CROPS = ['maize', 'cassava', 'yam', 'rice', 'beans'];
const MORE_CROPS = ['cocoa', 'sorghum', 'millet', 'teff', 'coffee', 'plantain', 'wheat', 'olives', 'dates'];

export function CropDoctor() {
  const { t } = useLanguage();
  const [mode, setMode] = useState('crop'); // 'crop' | 'soil'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState('maize');
  const [showMoreCrops, setShowMoreCrops] = useState(false);
  const fileInput = useRef(null);

  const acceptTypes = mode === 'soil'
    ? 'image/jpeg,image/png,image/webp,video/mp4,video/webm'
    : 'image/jpeg,image/png,image/webp';

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setIsVideo(f.type.startsWith('video/'));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const endpoint = mode === 'soil' ? '/api/crop-doctor/analyze-soil' : '/api/crop-doctor/diagnose';
    const form = new FormData();
    form.append(mode === 'soil' ? 'file' : 'image', file);
    if (mode === 'crop') form.append('crop', crop);
    try {
      const res = await fetch(endpoint, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
      if (navigator.vibrate) navigator.vibrate(100);
    } catch (err) {
      const friendlyMsg = t('errorRetry') || 'Something went wrong. Check your connection and try again.';
      setResult(mode === 'soil'
        ? { summary: friendlyMsg, likelyDeficiencies: [], recommendedCrops: [], improvements: [], confidence: 0, isError: true }
        : { diagnosis: friendlyMsg, condition: 'unknown', confidence: 0, treatment: [], prevention: [], isError: true }
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const switchMode = (m) => {
    setMode(m);
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div className="crop-doctor">
      <Seo
        title="AI Crop & Soil Doctor"
        description="Snap a photo of your crop or soil — get instant AI diagnosis for disease, pests & deficiencies. Maize, cassava, yam, rice & more. Free for African farmers."
        path="/crop-doctor"
      />
      <h2>🔬 {t('cropDoctorTitle')}</h2>
      <p className="subtitle">
        {mode === 'crop' ? t('cropDoctorSubtitle') : t('cropDoctorSoilSubtitle')}
      </p>

      <div className="mode-toggle">
        <button
          className={mode === 'crop' ? 'active' : ''}
          onClick={() => switchMode('crop')}
        >
          🌱 {t('cropMode')}
        </button>
        <button
          className={mode === 'soil' ? 'active' : ''}
          onClick={() => switchMode('soil')}
        >
          🌍 {t('soilMode')}
        </button>
      </div>

      {mode === 'crop' && (
        <div className="crop-select">
          <label>{t('cropType')}</label>
          <div className="crop-chips">
            {(showMoreCrops ? [...MAIN_CROPS, ...MORE_CROPS] : MAIN_CROPS).map((c) => (
              <button
                key={c}
                type="button"
                className={`crop-chip ${crop === c ? 'active' : ''}`}
                onClick={() => setCrop(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
            <button
              type="button"
              className="crop-chip more"
              onClick={() => setShowMoreCrops(!showMoreCrops)}
            >
              {showMoreCrops ? '− Less' : '+ More'}
            </button>
          </div>
        </div>
      )}

      <div className="upload-zone">
        <input
          ref={fileInput}
          type="file"
          accept={acceptTypes}
          onChange={handleFile}
          hidden
          capture={mode === 'soil' ? undefined : 'environment'}
        />
        {preview ? (
          <div className="preview-wrap">
            {isVideo ? (
              <video src={preview} controls muted loop playsInline />
            ) : (
              <img src={preview} alt="Preview" />
            )}
            <div className="preview-actions">
              <button onClick={() => fileInput.current?.click()} className="btn-secondary">{t('change')}</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? t('analyzing') : mode === 'soil' ? t('analyzeSoil') : t('diagnose')}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => fileInput.current?.click()} className="upload-btn upload-btn-illustration">
            <span className="upload-icon">📷</span>
            <span className="upload-steps">
              <span className="step">1</span>
              <span className="arrow">→</span>
              <span className="step">2</span>
              <span className="arrow">→</span>
              <span className="step">✓</span>
            </span>
            <span className="upload-label">
              {mode === 'soil' ? t('takePhotoSoil') : t('takePhotoCrop')}
            </span>
          </button>
        )}
      </div>

      {result && mode === 'crop' && (
        <div className={`diagnosis-result ${result.isError ? 'result-error' : ''}`}>
          {result.isError && <div className="error-illustration">😕</div>}
          <h3>{t('diagnosis')}</h3>
          <p className="diagnosis-text">{result.diagnosis}</p>
          {result.confidence > 0 && (
            <p className="confidence">Confidence: {Math.round(result.confidence * 100)}%</p>
          )}
          {result.condition && result.condition !== 'unknown' && (
            <span className={`badge ${result.condition}`}>{result.condition}</span>
          )}
          {result.isError && <button onClick={reset} className="btn-primary btn-retry">{t('retry') || 'Retry'}</button>}
          {result.treatment?.length > 0 && (
            <>
              <h4>{t('treatment')}</h4>
              <ul>
                {result.treatment.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </>
          )}
          {result.prevention?.length > 0 && (
            <>
              <h4>{t('prevention')}</h4>
              <ul>
                {result.prevention.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </>
          )}
          {!result.isError && <button onClick={reset} className="btn-secondary">{t('analyzeAnother')}</button>}
        </div>
      )}

      {result && mode === 'soil' && (
        <div className={`soil-result ${result.isError ? 'result-error' : ''}`}>
          {result.isError && <div className="error-illustration">😕</div>}
          <h3>{t('soilAnalysis')}</h3>
          <p className="diagnosis-text">{result.summary}</p>
          {result.isError && <button onClick={reset} className="btn-primary btn-retry">{t('retry') || 'Retry'}</button>}
          {result.confidence > 0 && (
            <p className="confidence">Confidence: {Math.round(result.confidence * 100)}%</p>
          )}

          {!result.isError && result.indicators && Object.keys(result.indicators).length > 0 && (
            <div className="indicators">
              <h4>{t('observations')}</h4>
              <ul>
                {Object.entries(result.indicators).map(([k, v]) => (
                  <li key={k}><strong>{k}</strong>: {v}</li>
                ))}
              </ul>
            </div>
          )}

          {!result.isError && result.likelyDeficiencies?.length > 0 && (
            <>
              <h4>{t('whatLacking')}</h4>
              <ul className="deficiency-list">
                {result.likelyDeficiencies.map((d, i) => (
                  <li key={i}>
                    <strong>{d.nutrient}</strong>: {d.sign} — {d.fix}
                  </li>
                ))}
              </ul>
            </>
          )}

          {!result.isError && result.recommendedCrops?.length > 0 && (
            <>
              <h4>🌾 {t('cropsToPlant')}</h4>
              <div className="crop-cards">
                {result.recommendedCrops.map((c, i) => (
                  <div key={i} className="crop-card">
                    <strong>{c.crop}</strong>
                    <p>{c.reason}</p>
                    {c.tips && <span className="tip">{c.tips}</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {!result.isError && result.improvements?.length > 0 && (
            <>
              <h4>{t('soilImprovements')}</h4>
              <ul>
                {result.improvements.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </>
          )}

          {!result.isError && <button onClick={reset} className="btn-secondary">{t('analyzeAnother')}</button>}
        </div>
      )}
    </div>
  );
}
