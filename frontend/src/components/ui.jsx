import { useMemo } from 'react';

import { initials } from '../utils/format.js';

export function Card({ as: Tag = 'div', tone, className = '', children, ...rest }) {
  const classes = ['card', tone ? `card--${tone}` : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({ children, hint, action }) {
  return (
    <div className="section-title">
      <span>{children}</span>
      {hint ? <span className="section-title__hint">{hint}</span> : null}
      {action}
    </div>
  );
}

export function Badge({ tone = 'gray', children, dot = false }) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot ? <i className="badge__dot" /> : null}
      {children}
    </span>
  );
}

export function Progress({ value = 0, tone = 'blue', height = 8, target, className = '' }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className={`progress ${className}`} style={{ height }}>
      <span className={`progress__bar progress__bar--${tone}`} style={{ width: `${safeValue}%` }} />
      {target !== undefined ? (
        <span
          className="progress__target"
          style={{ right: `${Math.min(100, Math.max(0, target))}%` }}
        />
      ) : null}
    </div>
  );
}

const CIRCUMFERENCE = 2 * Math.PI * 70;

export function Ring({ progress = 0, size = 150, children, tone = 'blue' }) {
  const safeProgress = Math.min(1, Math.max(0, progress));

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden="true">
        <circle cx="80" cy="80" r="70" fill="none" stroke="#E3E9F4" strokeWidth="10" strokeDasharray="3 6" />
        <circle
          className={`ring__value ring__value--${tone}`}
          cx="80"
          cy="80"
          r="70"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - safeProgress)}
        />
      </svg>
      <div className="ring__content">{children}</div>
    </div>
  );
}

const AVATAR_PALETTE = [
  ['#DCE6FB', '#1A2F6B'],
  ['#E2F6EE', '#14805A'],
  ['#FCEFD6', '#9A5E00'],
  ['#E8E4FB', '#4A3AA8'],
  ['#FBE3E6', '#B3283A'],
  ['#E0F3F8', '#0E6C82'],
];

export function Avatar({ name = '', size = 40, square = false }) {
  const [background, color] = useMemo(() => {
    const sum = name.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
  }, [name]);

  return (
    <span
      className={`avatar ${square ? 'avatar--square' : ''}`}
      style={{ width: size, height: size, background, color, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Stat({ label, value, suffix, hint, tone = '' }) {
  return (
    <div className={`stat ${tone ? `stat--${tone}` : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">
        {value}
        {suffix ? <small>{suffix}</small> : null}
      </span>
      {hint ? <span className="stat__hint">{hint}</span> : null}
    </div>
  );
}

export function LoadingState({ label = 'جارٍ تحميل البيانات…', compact = false }) {
  return (
    <div className={`loading ${compact ? 'loading--compact' : ''}`}>
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Card className="state-box state-box--error">
      <span className="state-box__icon">!</span>
      <div>
        <strong>تعذر تحميل البيانات</strong>
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
          إعادة المحاولة
        </button>
      ) : null}
    </Card>
  );
}

export function EmptyState({ title = 'لا توجد بيانات', description, children }) {
  return (
    <div className="empty">
      <span className="empty__icon">—</span>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}

export function Alert({ tone = 'success', children, onClose }) {
  return (
    <div className={`alert alert--${tone}`} role="status">
      <span>{children}</span>
      {onClose ? (
        <button type="button" className="alert__close" onClick={onClose} aria-label="إغلاق">
          ×
        </button>
      ) : null}
    </div>
  );
}
