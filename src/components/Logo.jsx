/**
 * FarmIQ brand logo — leaf mark + wordmark
 * Use variant="icon" for favicon-style, variant="full" for header (default)
 */
import './Logo.css';

export function Logo({ variant = 'full', size = 32, className = '' }) {
  const isIcon = variant === 'icon';

  return (
    <div className={`brand-logo brand-logo--${variant} ${className}`} style={{ '--logo-size': `${size}px` }}>
      <div className="brand-mark" aria-hidden>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width={isIcon ? 36 : 40} height={isIcon ? 36 : 40}>
          <defs>
            <linearGradient id="leaf-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--brand-gold)" />
              <stop offset="100%" stopColor="var(--brand-gold-light)" />
            </linearGradient>
          </defs>
          <path
            d="M32 14c-6 0-10 5-10 11 0 3 1 6 4 8l-5 22h22l-5-22c3-2 4-5 4-8 0-6-4-11-10-11z"
            fill="url(#leaf-grad)"
          />
          <circle cx="32" cy="27" r="5" fill="var(--brand-earth)" />
        </svg>
      </div>
      {!isIcon && (
        <span className="brand-wordmark">FarmIQ</span>
      )}
    </div>
  );
}
