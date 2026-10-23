import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { api } from '../api/index.js';
import { Alert } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { homeFor } from '../config/navigation.js';

const FALLBACK_ACCOUNTS = [
  { role: 'emp', label: 'موظف', email: 'ahmed@nasaq.co' },
  { role: 'hr', label: 'الموارد البشرية', email: 'mona@nasaq.co' },
  { role: 'mgmt', label: 'الإدارة التنفيذية', email: 'khaled@nasaq.co' },
];

const FEATURES = [
  'الحضور والانصراف مع ساعات العمل الأسبوعية',
  'قسائم الرواتب والبدلات والاستقطاعات',
  'الإجازات والطلبات وموافقات المديرين',
  'التوظيف ومؤشرات أداء الأقسام',
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [demo, setDemo] = useState({ password: '123456', accounts: FALLBACK_ACCOUNTS });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('nasaq_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nasaq_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    api.auth
      .demoAccounts()
      .then((data) => setDemo(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) navigate(homeFor(user.role), { replace: true });
  }, [user, navigate]);

  const redirectAfterLogin = (loggedUser) => {
    const from = location.state?.from;
    const target = from && from !== '/login' ? from : homeFor(loggedUser.role);
    navigate(target, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const loggedUser = await login(form.email.trim(), form.password);
      redirectAfterLogin(loggedUser);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (account) => {
    setError('');
    setSubmitting(true);
    setForm({ email: account.email, password: demo.password || '123456' });

    try {
      const loggedUser = await login(account.email, demo.password || '123456');
      redirectAfterLogin(loggedUser);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <div className="login__frame">
        <section className="login__brand">
          <Link to="/" className="login__brand-top" style={{ textDecoration: 'none', color: 'inherit' }} title="العودة إلى الصفحة الرئيسية">
            <span className="brand__mark brand__mark--light" />
            <span className="login__logo-text">نسق</span>
          </Link>

          <div className="login__brand-body">
            <h1>
              كل ما يخص فريقك
              <br />
              في مكان واحد.
            </h1>
            <p>
              من الحضور والانصراف إلى الرواتب والإجازات ومؤشرات الأداء — تجربة واحدة سريعة وواضحة لفريق الموارد البشرية والموظفين والإدارة.
            </p>

            <ul className="login__features">
              {FEATURES.map((feature) => (
                <li key={feature}>
                  <span className="login__check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="login__brand-footer">
            <span>نسق © 2026</span>
            <span>نظام إدارة الموارد البشرية الذكي</span>
          </div>

          <span className="login__orb login__orb--one" />
          <span className="login__orb login__orb--two" />
        </section>

        <section className="login__panel">
          <div className="login__form-wrap">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                }}
              >
                <span>← العودة إلى الصفحة الرئيسية</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="icon-btn icon-btn--small"
                  title={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
                  aria-label="تبديل المظهر"
                  style={{ borderRadius: '50%' }}
                >
                  {theme === 'dark' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <span className="eyebrow">أهلاً بعودتك</span>
            <h2>تسجيل الدخول</h2>
            <p className="login__hint">ادخل ببيانات حسابك للوصول إلى لوحة التحكم.</p>

            {error ? <Alert tone="error">{error}</Alert> : null}

            <form className="login__form" onSubmit={handleSubmit}>
              <label className="field">
                <span>البريد الإلكتروني</span>
                <input
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="name@nasaq.co"
                  required
                />
              </label>

              <label className="field">
                <span>كلمة المرور</span>
                <input
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="••••••"
                  required
                />
              </label>

              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="login__demo">
              <div className="login__demo-head">
                <span>دخول سريع للتجربة</span>
                <small>كلمة المرور: {demo.password || '123456'}</small>
              </div>

              <div className="login__demo-buttons">
                {(demo.accounts || FALLBACK_ACCOUNTS).map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => quickLogin(account)}
                    disabled={submitting}
                  >
                    <strong>{account.label}</strong>
                    <small dir="ltr">{account.email}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
