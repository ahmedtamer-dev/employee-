import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { FAQ_DATA } from '../i18n/translations.js';
import { homeFor } from '../config/navigation.js';
import { Avatar } from '../components/ui.jsx';
import '../styles/landing.css';

export default function Landing() {
  const { user, login } = useAuth();
  const { t, lang, isRtl } = useLanguage();
  const navigate = useNavigate();

  // Interactive state
  const [activeTab, setActiveTab] = useState('emp'); // 'emp' | 'hr' | 'mgmt'
  const [roleTab, setRoleTab] = useState('emp');
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [punchedIn, setPunchedIn] = useState(false);
  const [approvedLeave, setApprovedLeave] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('nasaq_theme') || 'light');

  const arrow = isRtl ? '←' : '→';

  // Demo accounts localized
  const demoAccounts = [
    {
      role: 'emp',
      name: 'أحمد سمير',
      roleLabel: t('role.emp'),
      email: 'ahmed@nasaq.co',
      dept: 'التصميم',
    },
    {
      role: 'hr',
      name: 'منى عادل',
      roleLabel: t('role.hr'),
      email: 'mona@nasaq.co',
      dept: 'الموارد البشرية',
    },
    {
      role: 'mgmt',
      name: 'خالد منصور',
      roleLabel: t('role.mgmt'),
      email: 'khaled@nasaq.co',
      dept: 'الإدارة التنفيذية',
    },
  ];

  // Week bars
  const weekBars = [
    { day: 'الأحد', h: '8.5', px: 72, active: false },
    { day: 'الإثنين', h: '8.0', px: 68, active: false },
    { day: 'الثلاثاء', h: '9.2', px: 78, active: false },
    { day: 'الأربعاء', h: '8.5', px: 72, active: false },
    { day: 'الخميس', h: '8.8', px: 75, active: true },
  ];

  // FAQs
  const faqs = FAQ_DATA.ar || FAQ_DATA;

  // Sync theme with html data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nasaq_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Live ticking clock in preview
  const [timeStr, setTimeStr] = useState('08:30:15');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickLogin = async (account) => {
    setLoggingIn(true);
    try {
      const loggedUser = await login(account.email, '123456');
      navigate(homeFor(loggedUser.role));
    } catch {
      navigate('/login');
    } finally {
      setLoggingIn(false);
      setShowDemoModal(false);
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Ambient background blur orbs */}
      <div className="landing-ambient-orb landing-ambient-orb--1" />
      <div className="landing-ambient-orb landing-ambient-orb--2" />
      <div className="landing-ambient-orb landing-ambient-orb--3" />

      {/* ------------------------------------------------------------
          Sticky Navigation Bar
          ------------------------------------------------------------ */}
      <header className="landing-header-wrap">
        <nav className="landing-nav" aria-label="Main Navigation">
          <Link to="/" className="landing-nav__brand">
            <span className="brand__mark" />
            <span className="brand__name">{t('brand.name')}</span>
            <span className="landing-brand-tag">{t('brand.tag')}</span>
          </Link>

          <ul className="landing-nav__links">
            <li>
              <button type="button" onClick={() => scrollTo('features')} className="landing-nav__link">
                {t('landing.nav.features')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollTo('preview')} className="landing-nav__link">
                {t('landing.nav.preview')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollTo('roles')} className="landing-nav__link">
                {t('landing.nav.roles')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollTo('compare')} className="landing-nav__link">
                {t('landing.nav.compare')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollTo('pricing')} className="landing-nav__link">
                {t('landing.nav.pricing')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollTo('faq')} className="landing-nav__link">
                {t('landing.nav.faq')}
              </button>
            </li>
          </ul>

          <div className="landing-nav__actions">
            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              className="landing-theme-toggle"
              onClick={toggleTheme}
              title={t('common.toggleTheme')}
              aria-label={t('common.toggleTheme')}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {user ? (
              <Link to={homeFor(user.role)} className="btn-landing-primary">
                <span>{t('common.dashboard')} ({user.name.split(' ')[0]})</span>
                <span>{arrow}</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-landing-secondary">
                  {t('common.signIn')}
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="btn-landing-primary"
                >
                  <span>{t('common.liveDemo')}</span>
                  <span>✦</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------
          Hero Section
          ------------------------------------------------------------ */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero__badge">
            <span className="landing-hero__badge-pulse" />
            <span>{t('landing.hero.badge')}</span>
          </div>

          <h1 className="landing-hero__title">
            {t('landing.hero.title1')}
            <br />
            {t('landing.hero.title2')} <span className="landing-hero__title-highlight">{t('landing.hero.titleHighlight')}</span>
          </h1>

          <p className="landing-hero__subtitle">
            {t('landing.hero.subtitle')}
          </p>

          <div className="landing-hero__ctas">
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="btn-landing-primary landing-hero__cta-main"
            >
              <span>{t('landing.hero.ctaMain')}</span>
              <span>{arrow}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo('preview')}
              className="btn-landing-secondary"
            >
              <span>{t('landing.hero.ctaSecondary')}</span>
              <span>👁</span>
            </button>
          </div>

          <div className="landing-hero__trust">
            <div className="landing-hero__trust-item">
              <span className="landing-hero__trust-icon">✓</span>
              <span>{t('landing.hero.trust1')}</span>
            </div>
            <div className="landing-hero__trust-item">
              <span className="landing-hero__trust-icon">✓</span>
              <span>{t('landing.hero.trust2')}</span>
            </div>
            <div className="landing-hero__trust-item">
              <span className="landing-hero__trust-icon">✓</span>
              <span>{t('landing.hero.trust3')}</span>
            </div>
            <div className="landing-hero__trust-item">
              <span className="landing-hero__trust-icon">✓</span>
              <span>{t('landing.hero.trust4')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          Interactive Live Dashboard Preview
          ------------------------------------------------------------ */}
      <section id="preview" className="landing-preview-wrap">
        {/* Floating Highlight Chips */}
        <div className="landing-float-chip landing-float-chip--top-right">
          <span className="landing-float-chip__icon landing-float-chip__icon--green">✓</span>
          <div className="landing-float-chip__text">
            <strong>{t('landing.chip1.title')}</strong>
            <small>{t('landing.chip1.sub')}</small>
          </div>
        </div>

        <div className="landing-float-chip landing-float-chip--bottom-left">
          <span className="landing-float-chip__icon landing-float-chip__icon--blue">⚡</span>
          <div className="landing-float-chip__text">
            <strong>{t('landing.chip2.title')}</strong>
            <small>{t('landing.chip2.sub')}</small>
          </div>
        </div>

        {/* Main Application Frame Simulation */}
        <div className="landing-preview-frame">
          <div className="landing-preview-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="brand landing-preview-brand" style={{ padding: '6px 16px' }}>
                <span className="brand__mark" />
                <span className="brand__name" style={{ fontSize: '18px' }}>{t('brand.name')}</span>
              </div>
              <span className="landing-preview-live-indicator">
                <span className="landing-preview-live-dot" />
                {t('landing.preview.liveSim')}
              </span>
            </div>

            <div className="landing-preview-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('emp')}
                className={`landing-preview-tab-btn ${activeTab === 'emp' ? 'is-active' : ''}`}
              >
                <span>{t('landing.preview.tabEmp')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hr')}
                className={`landing-preview-tab-btn ${activeTab === 'hr' ? 'is-active' : ''}`}
              >
                <span>{t('landing.preview.tabHr')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mgmt')}
                className={`landing-preview-tab-btn ${activeTab === 'mgmt' ? 'is-active' : ''}`}
              >
                <span>{t('landing.preview.tabMgmt')}</span>
              </button>
            </div>
          </div>

          {/* Tab Content 1: Employee View */}
          {activeTab === 'emp' && (
            <div className="landing-preview-stage">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: 0, fontWeight: 400 }}>
                    {t('preview.emp.greeting')}
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                    {t('preview.emp.role')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{t('preview.emp.leaveBalance')}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 300 }}>
                      {t('preview.emp.leaveDays')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{t('preview.emp.weeklyHours')}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 300 }}>
                      {t('preview.emp.weeklyHoursVal')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="preview-grid-3">
                {/* Attendance Ring Card */}
                <div className="preview-card">
                  <div className="preview-card__head">
                    <span className="preview-card__title">{t('preview.emp.attendanceCard')}</span>
                    <span className="badge badge--green" style={{ fontSize: '11px' }}>
                      {punchedIn ? t('preview.emp.statusIn') : t('preview.emp.statusWait')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                    <div className="preview-clock">{timeStr}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
                      {t('preview.emp.trackedHours')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPunchedIn(!punchedIn)}
                    className={`preview-punch-btn ${punchedIn ? 'is-punched' : ''}`}
                  >
                    {punchedIn ? t('preview.emp.punched') : t('preview.emp.punchIn')}
                  </button>
                </div>

                {/* Weekly Hours Bar Card */}
                <div className="preview-card">
                  <div className="preview-card__head">
                    <span className="preview-card__title">{t('preview.emp.weeklyCard')}</span>
                    <span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600 }}>{t('preview.emp.overtime')}</span>
                  </div>
                  <div className="preview-bars">
                    {weekBars.map((bar) => (
                      <div className="preview-bar-col" key={bar.day}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{bar.h}{t('common.hourShort')}</span>
                        <div
                          className={`preview-bar-fill ${bar.active ? 'is-active' : ''}`}
                          style={{ height: `${bar.px}px` }}
                        />
                        <span className="preview-bar-day">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Salary Card (Navy) */}
                <div className="preview-card preview-card--navy">
                  <div className="preview-card__head">
                    <span className="preview-card__title" style={{ color: '#fff' }}>{t('preview.emp.salaryCard')}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.18)', padding: '3px 9px', borderRadius: '999px' }}>
                      {t('preview.emp.payDate')}
                    </span>
                  </div>
                  <div style={{ margin: 'auto 0' }}>
                    <div style={{ fontSize: '11.5px', opacity: 0.75 }}>{t('preview.emp.netSalary')}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, lineHeight: 1.2 }}>
                      24,500 <small style={{ fontSize: '14px' }}>{t('common.currency')}</small>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', margin: '14px 0 8px' }}>
                    <div style={{ flex: 85, height: '6px', borderRadius: '6px', background: '#fff' }} />
                    <div style={{ flex: 15, height: '6px', borderRadius: '6px', background: 'var(--red)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.85 }}>
                    <span>{t('preview.emp.earnings')}</span>
                    <span>{t('preview.emp.deductions')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: HR View */}
          {activeTab === 'hr' && (
            <div className="landing-preview-stage">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: 0, fontWeight: 400 }}>
                    {t('preview.hr.title')}
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                    {t('preview.hr.subtitle')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span className="badge badge--green" style={{ fontSize: '12px', padding: '6px 14px' }}>
                    {t('preview.hr.badgeEmp')}
                  </span>
                  <span className="badge badge--blue" style={{ fontSize: '12px', padding: '6px 14px' }}>
                    {t('preview.hr.badgePayroll')}
                  </span>
                </div>
              </div>

              <div className="preview-grid-3">
                {/* Approvals Checklist */}
                <div className="preview-card" style={{ gridColumn: 'span 2' }}>
                  <div className="preview-card__head">
                    <span className="preview-card__title">{t('preview.hr.pendingLeaves')}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{t('preview.hr.newRequests')}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="preview-approval-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={isRtl ? 'سارة خليل' : 'Sarah Khalil'} size={34} />
                        <div>
                          <strong style={{ fontSize: '13px', display: 'block' }}>{t('preview.hr.req1Name')}</strong>
                          <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{t('preview.hr.req1Dates')}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setApprovedLeave(!approvedLeave)}
                          style={{
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            background: approvedLeave ? 'var(--green)' : 'var(--blue)',
                            color: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          {approvedLeave ? t('preview.hr.req1Approved') : t('preview.hr.req1Approve')}
                        </button>
                      </div>
                    </div>

                    <div className="preview-approval-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={isRtl ? 'عمر الشامي' : 'Omar Shami'} size={34} />
                        <div>
                          <strong style={{ fontSize: '13px', display: 'block' }}>{t('preview.hr.req2Name')}</strong>
                          <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{t('preview.hr.req2Dates')}</span>
                        </div>
                      </div>
                      <span className="badge badge--gray" style={{ fontSize: '11px' }}>{t('preview.hr.underReview')}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Hiring Pipeline */}
                <div className="preview-card">
                  <div className="preview-card__head">
                    <span className="preview-card__title">{t('preview.hr.hiringTitle')}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 'auto 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>{t('preview.hr.hiringNew')}</span>
                      <strong>18</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>{t('preview.hr.hiringInterviews')}</span>
                      <strong style={{ color: 'var(--blue)' }}>4</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>{t('preview.hr.hiringOffers')}</span>
                      <strong style={{ color: 'var(--green-dark)' }}>2</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoModal(true)}
                    className="preview-portal-btn"
                  >
                    {t('preview.hr.openHiring')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Management View */}
          {activeTab === 'mgmt' && (
            <div className="landing-preview-stage">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: 0, fontWeight: 400 }}>
                    {t('preview.mgmt.title')}
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                    {t('preview.mgmt.subtitle')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{t('preview.mgmt.companyAvg')}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--navy)' }}>94.6%</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{t('preview.mgmt.headcount')}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--navy)' }}>
                      24 {t('common.employees')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="preview-grid-3">
                {/* Attendance Distribution */}
                <div className="preview-card" style={{ gridColumn: 'span 2' }}>
                  <div className="preview-card__head">
                    <span className="preview-card__title">{t('preview.mgmt.statusDist')}</span>
                    <span style={{ fontSize: '12px', color: 'var(--green-dark)', fontWeight: 600 }}>{t('preview.mgmt.attRate')}</span>
                  </div>

                  <div style={{ display: 'flex', height: '14px', borderRadius: '8px', overflow: 'hidden', margin: '14px 0 16px' }}>
                    <div style={{ flex: 82, background: 'var(--navy)' }} />
                    <div style={{ flex: 10, background: 'var(--blue)' }} />
                    <div style={{ flex: 5, background: 'var(--sky)' }} />
                    <div style={{ flex: 3, background: 'var(--red)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
                    <span>{t('preview.mgmt.distOffice')}</span>
                    <span>{t('preview.mgmt.distLeaves')}</span>
                    <span>{t('preview.mgmt.distRemote')}</span>
                    <span>{t('preview.mgmt.distAbsent')}</span>
                  </div>
                </div>

                {/* Employee of the Month */}
                <div className="preview-card preview-card--spotlight">
                  <div className="preview-card__head">
                    <span className="preview-card__title">{t('preview.mgmt.eomTitle')}</span>
                    <span style={{ fontSize: '13px' }}>🏆</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 'auto 0' }}>
                    <Avatar name={isRtl ? 'أحمد سمير' : 'Ahmed Samir'} size={46} square />
                    <div>
                      <strong className="preview-spotlight-name" style={{ fontSize: '14px', display: 'block' }}>
                        {t('preview.mgmt.eomName')}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{t('preview.mgmt.eomDesc')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--green-dark)', marginTop: '8px' }}>
                    {t('preview.mgmt.eomBonus')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------
          Stats Strip (Social Proof)
          ------------------------------------------------------------ */}
      <section className="landing-stats-strip">
        <div className="landing-container">
          <div className="landing-stats-grid">
            <div className="landing-stat-box">
              <div className="landing-stat-number">
                <span>{t('landing.stat1.num')}</span>
                <span className="landing-stat-suffix">{t('landing.stat1.suffix')}</span>
              </div>
              <div className="landing-stat-label">{t('landing.stat1.label')}</div>
              <div className="landing-stat-hint">{t('landing.stat1.hint')}</div>
            </div>

            <div className="landing-stat-box">
              <div className="landing-stat-number">
                <span>{t('landing.stat2.num')}</span>
                <span className="landing-stat-suffix">{t('landing.stat2.suffix')}</span>
              </div>
              <div className="landing-stat-label">{t('landing.stat2.label')}</div>
              <div className="landing-stat-hint">{t('landing.stat2.hint')}</div>
            </div>

            <div className="landing-stat-box">
              <div className="landing-stat-number">
                <span>{t('landing.stat3.num')}</span>
                <span className="landing-stat-suffix">{t('landing.stat3.suffix')}</span>
              </div>
              <div className="landing-stat-label">{t('landing.stat3.label')}</div>
              <div className="landing-stat-hint">{t('landing.stat3.hint')}</div>
            </div>

            <div className="landing-stat-box">
              <div className="landing-stat-number">
                <span>{t('landing.stat4.num')}</span>
                <span className="landing-stat-suffix">{t('landing.stat4.suffix')}</span>
              </div>
              <div className="landing-stat-label">{t('landing.stat4.label')}</div>
              <div className="landing-stat-hint">{t('landing.stat4.hint')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          Core Features Bento Grid
          ------------------------------------------------------------ */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t('landing.bento.eyebrow')}</span>
            <h2 className="landing-section-title">
              {t('landing.bento.title')}
            </h2>
            <p className="landing-section-desc">
              {t('landing.bento.desc')}
            </p>
          </div>

          <div className="landing-bento-grid">
            {/* Feature 1: Featured Attendance */}
            <div className="bento-card bento-card--featured">
              <div className="bento-card__icon-wrap">⏱</div>
              <h3 className="bento-card__title">{t('landing.bento.f1.title')}</h3>
              <p className="bento-card__text">
                {t('landing.bento.f1.text')}
              </p>
              <div className="bento-card__tags">
                <span className="bento-tag">{t('landing.bento.f1.tag1')}</span>
                <span className="bento-tag">{t('landing.bento.f1.tag2')}</span>
                <span className="bento-tag">{t('landing.bento.f1.tag3')}</span>
              </div>
            </div>

            {/* Feature 2: Payroll */}
            <div className="bento-card">
              <div className="bento-card__icon-wrap">💳</div>
              <h3 className="bento-card__title">{t('landing.bento.f2.title')}</h3>
              <p className="bento-card__text">
                {t('landing.bento.f2.text')}
              </p>
              <div className="bento-card__tags">
                <span className="bento-tag">{t('landing.bento.f2.tag1')}</span>
                <span className="bento-tag">{t('landing.bento.f2.tag2')}</span>
              </div>
            </div>

            {/* Feature 3: Leaves & Requests */}
            <div className="bento-card">
              <div className="bento-card__icon-wrap">🏖</div>
              <h3 className="bento-card__title">{t('landing.bento.f3.title')}</h3>
              <p className="bento-card__text">
                {t('landing.bento.f3.text')}
              </p>
              <div className="bento-card__tags">
                <span className="bento-tag">{t('landing.bento.f3.tag1')}</span>
                <span className="bento-tag">{t('landing.bento.f3.tag2')}</span>
              </div>
            </div>

            {/* Feature 4: KPIs & Analytics */}
            <div className="bento-card">
              <div className="bento-card__icon-wrap">📊</div>
              <h3 className="bento-card__title">{t('landing.bento.f4.title')}</h3>
              <p className="bento-card__text">
                {t('landing.bento.f4.text')}
              </p>
              <div className="bento-card__tags">
                <span className="bento-tag">{t('landing.bento.f4.tag1')}</span>
                <span className="bento-tag">{t('landing.bento.f4.tag2')}</span>
              </div>
            </div>

            {/* Feature 5: Recruitment */}
            <div className="bento-card">
              <div className="bento-card__icon-wrap">🎯</div>
              <h3 className="bento-card__title">{t('landing.bento.f5.title')}</h3>
              <p className="bento-card__text">
                {t('landing.bento.f5.text')}
              </p>
              <div className="bento-card__tags">
                <span className="bento-tag">{t('landing.bento.f5.tag1')}</span>
                <span className="bento-tag">{t('landing.bento.f5.tag2')}</span>
              </div>
            </div>

            {/* Feature 6: Security & Isolation */}
            <div className="bento-card">
              <div className="bento-card__icon-wrap">🔒</div>
              <h3 className="bento-card__title">{t('landing.bento.f6.title')}</h3>
              <p className="bento-card__text">
                {t('landing.bento.f6.text')}
              </p>
              <div className="bento-card__tags">
                <span className="bento-tag">{t('landing.bento.f6.tag1')}</span>
                <span className="bento-tag">{t('landing.bento.f6.tag2')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          Role-Based Solutions Section
          ------------------------------------------------------------ */}
      <section id="roles" className="landing-roles-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t('landing.roles.eyebrow')}</span>
            <h2 className="landing-section-title">{t('landing.roles.title')}</h2>
            <p className="landing-section-desc">
              {t('landing.roles.desc')}
            </p>
          </div>

          <div className="landing-roles-frame">
            <div className="landing-roles-nav">
              <button
                type="button"
                onClick={() => setRoleTab('emp')}
                className={`landing-role-tab ${roleTab === 'emp' ? 'is-active' : ''}`}
              >
                <span>{t('landing.roles.tabEmp')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleTab('hr')}
                className={`landing-role-tab ${roleTab === 'hr' ? 'is-active' : ''}`}
              >
                <span>{t('landing.roles.tabHr')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleTab('mgmt')}
                className={`landing-role-tab ${roleTab === 'mgmt' ? 'is-active' : ''}`}
              >
                <span>{t('landing.roles.tabMgmt')}</span>
              </button>
            </div>

            {/* Role 1 Details */}
            {roleTab === 'emp' && (
              <div className="landing-role-detail">
                <div className="landing-role-info">
                  <h3>{t('landing.roles.emp.title')}</h3>
                  <p>
                    {t('landing.roles.emp.desc')}
                  </p>
                  <ul className="landing-role-bullets">
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.emp.b1')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.emp.b2')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.emp.b3')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.emp.b4')}</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(demoAccounts[0])}
                    className="btn-landing-primary"
                  >
                    <span>{t('landing.roles.emp.btn')}</span>
                    <span>{arrow}</span>
                  </button>
                </div>

                <div className="landing-role-visual-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <Avatar name={isRtl ? 'أحمد سمير' : 'Ahmed Samir'} size={54} />
                    <div>
                      <strong className="landing-role-user-name" style={{ fontSize: '16px', display: 'block' }}>
                        {isRtl ? 'أحمد سمير' : 'Ahmed Samir'}
                      </strong>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {isRtl ? 'مصمم واجهات · كود الموظف: EMP-104' : 'UI Designer · Employee ID: EMP-104'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="landing-role-stat-box">
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{t('landing.roles.emp.stat1')}</span>
                      <strong className="landing-role-stat-val" style={{ fontSize: '20px' }}>
                        {isRtl ? '14 يوماً' : '14 Days'}
                      </strong>
                    </div>
                    <div className="landing-role-stat-box">
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{t('landing.roles.emp.stat2')}</span>
                      <strong className="landing-role-stat-val text-green" style={{ fontSize: '20px' }}>
                        {isRtl ? '96% ممتاز' : '96% Excellent'}
                      </strong>
                    </div>
                  </div>
                  <div className="landing-role-banner landing-role-banner--emp">
                    {t('landing.roles.emp.banner')}
                  </div>
                </div>
              </div>
            )}

            {/* Role 2 Details */}
            {roleTab === 'hr' && (
              <div className="landing-role-detail">
                <div className="landing-role-info">
                  <h3>{t('landing.roles.hr.title')}</h3>
                  <p>
                    {t('landing.roles.hr.desc')}
                  </p>
                  <ul className="landing-role-bullets">
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.hr.b1')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.hr.b2')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.hr.b3')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.hr.b4')}</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(demoAccounts[1])}
                    className="btn-landing-primary"
                  >
                    <span>{t('landing.roles.hr.btn')}</span>
                    <span>{arrow}</span>
                  </button>
                </div>

                <div className="landing-role-visual-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <Avatar name={isRtl ? 'منى عادل' : 'Mona Adel'} size={54} />
                    <div>
                      <strong className="landing-role-user-name" style={{ fontSize: '16px', display: 'block' }}>
                        {isRtl ? 'منى عادل' : 'Mona Adel'}
                      </strong>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {isRtl ? 'مدير الموارد البشرية · صلاحيات كاملة' : 'HR Director · Full Access'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="landing-role-stat-box">
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{t('landing.roles.hr.stat1')}</span>
                      <strong className="landing-role-stat-val" style={{ fontSize: '20px' }}>
                        348,200 {t('common.currency')}
                      </strong>
                    </div>
                    <div className="landing-role-stat-box">
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{t('landing.roles.hr.stat2')}</span>
                      <strong className="landing-role-stat-val text-blue" style={{ fontSize: '20px' }}>
                        {isRtl ? '8 مرشحين' : '8 Candidates'}
                      </strong>
                    </div>
                  </div>
                  <div className="landing-role-banner landing-role-banner--hr">
                    {t('landing.roles.hr.banner')}
                  </div>
                </div>
              </div>
            )}

            {/* Role 3 Details */}
            {roleTab === 'mgmt' && (
              <div className="landing-role-detail">
                <div className="landing-role-info">
                  <h3>{t('landing.roles.mgmt.title')}</h3>
                  <p>
                    {t('landing.roles.mgmt.desc')}
                  </p>
                  <ul className="landing-role-bullets">
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.mgmt.b1')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.mgmt.b2')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.mgmt.b3')}</span>
                    </li>
                    <li>
                      <span className="landing-bullet-check">✓</span>
                      <span>{t('landing.roles.mgmt.b4')}</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(demoAccounts[2])}
                    className="btn-landing-primary"
                  >
                    <span>{t('landing.roles.mgmt.btn')}</span>
                    <span>{arrow}</span>
                  </button>
                </div>

                <div className="landing-role-visual-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <Avatar name={isRtl ? 'خالد منصور' : 'Khaled Mansour'} size={54} />
                    <div>
                      <strong className="landing-role-user-name" style={{ fontSize: '16px', display: 'block' }}>
                        {isRtl ? 'خالد منصور' : 'Khaled Mansour'}
                      </strong>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {isRtl ? 'المدير العام · إدارة العمليات' : 'General Director · Operations'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="landing-role-stat-box">
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{t('landing.roles.mgmt.stat1')}</span>
                      <strong className="landing-role-stat-val" style={{ fontSize: '20px' }}>
                        {isRtl ? '94.2% ممتاز' : '94.2% Excellent'}
                      </strong>
                    </div>
                    <div className="landing-role-stat-box">
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{t('landing.roles.mgmt.stat2')}</span>
                      <strong className="landing-role-stat-val text-green" style={{ fontSize: '20px' }}>
                        98.5%
                      </strong>
                    </div>
                  </div>
                  <div className="landing-role-banner landing-role-banner--mgmt">
                    {t('landing.roles.mgmt.banner')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          Comparison Section: Old Way vs Nasaq
          ------------------------------------------------------------ */}
      <section id="compare" className="landing-compare-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t('landing.compare.eyebrow')}</span>
            <h2 className="landing-section-title">{t('landing.compare.title')}</h2>
            <p className="landing-section-desc">
              {t('landing.compare.desc')}
            </p>
          </div>

          <div className="landing-compare-grid">
            {/* Old Way Column */}
            <div className="landing-compare-col landing-compare-col--old">
              <div className="landing-compare-header">
                <span style={{ fontSize: '24px' }}>⏳</span>
                <div>
                  <h3 className="landing-compare-heading landing-compare-heading--old" style={{ margin: 0 }}>
                    {t('landing.compare.oldTitle')}
                  </h3>
                  <small className="landing-compare-sub--old">{t('landing.compare.oldSub')}</small>
                </div>
              </div>
              <ul className="landing-compare-list">
                <li>
                  <span className="compare-badge-x">✕</span>
                  <span>{t('landing.compare.old1')}</span>
                </li>
                <li>
                  <span className="compare-badge-x">✕</span>
                  <span>{t('landing.compare.old2')}</span>
                </li>
                <li>
                  <span className="compare-badge-x">✕</span>
                  <span>{t('landing.compare.old3')}</span>
                </li>
                <li>
                  <span className="compare-badge-x">✕</span>
                  <span>{t('landing.compare.old4')}</span>
                </li>
                <li>
                  <span className="compare-badge-x">✕</span>
                  <span>{t('landing.compare.old5')}</span>
                </li>
              </ul>
            </div>

            {/* Nasaq Way Column */}
            <div className="landing-compare-col landing-compare-col--nasaq">
              <div className="landing-compare-header">
                <span className="brand__mark brand__mark--large" />
                <div>
                  <h3 className="landing-compare-heading landing-compare-heading--nasaq" style={{ margin: 0 }}>
                    {t('landing.compare.nasaqTitle')}
                  </h3>
                  <small style={{ color: 'var(--blue)', fontWeight: 600 }}>{t('landing.compare.nasaqSub')}</small>
                </div>
              </div>
              <ul className="landing-compare-list">
                <li>
                  <span className="compare-badge-check">✓</span>
                  <span>{t('landing.compare.nasaq1')}</span>
                </li>
                <li>
                  <span className="compare-badge-check">✓</span>
                  <span>{t('landing.compare.nasaq2')}</span>
                </li>
                <li>
                  <span className="compare-badge-check">✓</span>
                  <span>{t('landing.compare.nasaq3')}</span>
                </li>
                <li>
                  <span className="compare-badge-check">✓</span>
                  <span>{t('landing.compare.nasaq4')}</span>
                </li>
                <li>
                  <span className="compare-badge-check">✓</span>
                  <span>{t('landing.compare.nasaq5')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          Interactive Pricing Section
          ------------------------------------------------------------ */}
      <section id="pricing" className="landing-pricing">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t('landing.pricing.eyebrow')}</span>
            <h2 className="landing-section-title">{t('landing.pricing.title')}</h2>
            <p className="landing-section-desc">
              {t('landing.pricing.desc')}
            </p>
          </div>

          <div className="pricing-billing-toggle">
            <span className={`pricing-billing-label ${!billingAnnual ? 'is-active' : ''}`}>
              {t('landing.pricing.monthly')}
            </span>
            <div className="pricing-toggle-pill">
              <button
                type="button"
                onClick={() => setBillingAnnual(!billingAnnual)}
                className={`pricing-toggle-btn ${billingAnnual ? 'is-active' : ''}`}
              >
                {isRtl ? 'سنوي' : 'Annual'}
              </button>
            </div>
            <span className={`pricing-billing-label ${billingAnnual ? 'is-active' : ''}`}>
              {t('landing.pricing.annual')}
            </span>
            <span className="pricing-save-badge">{t('landing.pricing.saveBadge')}</span>
          </div>

          <div className="pricing-cards-grid">
            {/* Plan 1: Starter */}
            <div className="pricing-card">
              <h3 className="pricing-card__name">{t('landing.pricing.p1Name')}</h3>
              <p className="pricing-card__desc">{t('landing.pricing.p1Desc')}</p>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">
                  {billingAnnual ? '319' : '399'}
                </span>
                <span className="pricing-card__period"> {t('landing.pricing.perMonth')}</span>
              </div>
              <ul className="pricing-card__features">
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p1f1')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p1f2')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p1f3')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p1f4')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p1f5')}</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="btn-landing-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t('landing.pricing.p1Btn')}
              </button>
            </div>

            {/* Plan 2: Growth (Popular) */}
            <div className="pricing-card pricing-card--popular">
              <span className="pricing-card__popular-badge">{t('landing.pricing.p2Badge')}</span>
              <h3 className="pricing-card__name">{t('landing.pricing.p2Name')}</h3>
              <p className="pricing-card__desc">{t('landing.pricing.p2Desc')}</p>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">
                  {billingAnnual ? '639' : '799'}
                </span>
                <span className="pricing-card__period"> {t('landing.pricing.perMonth')}</span>
              </div>
              <ul className="pricing-card__features">
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p2f1')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p2f2')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p2f3')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p2f4')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p2f5')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p2f6')}</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="btn-landing-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t('landing.pricing.p2Btn')}
              </button>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="pricing-card">
              <h3 className="pricing-card__name">{t('landing.pricing.p3Name')}</h3>
              <p className="pricing-card__desc">{t('landing.pricing.p3Desc')}</p>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">
                  {billingAnnual ? '1,199' : '1,499'}
                </span>
                <span className="pricing-card__period"> {t('landing.pricing.perMonth')}</span>
              </div>
              <ul className="pricing-card__features">
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p3f1')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p3f2')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p3f3')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p3f4')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p3f5')}</li>
                <li><span className="pricing-check">✓</span> {t('landing.pricing.p3f6')}</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="btn-landing-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t('landing.pricing.p3Btn')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          FAQ Section
          ------------------------------------------------------------ */}
      <section id="faq" className="landing-faq">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">{t('landing.faq.eyebrow')}</span>
            <h2 className="landing-section-title">{t('landing.faq.title')}</h2>
            <p className="landing-section-desc">
              {t('landing.faq.desc')}
            </p>
          </div>

          <div className="landing-faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="faq-question"
                  >
                    <span>{faq.q}</span>
                    <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <div className="faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          Mega Call-to-Action Card
          ------------------------------------------------------------ */}
      <section className="landing-mega-cta">
        <div className="landing-container">
          <div className="mega-cta-card">
            <div className="mega-cta-orb mega-cta-orb--1" />
            <div className="mega-cta-orb mega-cta-orb--2" />

            <h2>
              {t('landing.mega.title')}
            </h2>
            <p>
              {t('landing.mega.desc')}
            </p>

            <div className="mega-cta-buttons">
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="btn-mega-light"
              >
                <span>{t('landing.mega.btnMain')}</span>
                <span>✦</span>
              </button>
              <Link to="/login" className="btn-mega-ghost">
                {t('landing.mega.btnSec')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          Footer
          ------------------------------------------------------------ */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="brand__mark" />
              <span className="brand__name" style={{ fontSize: '22px' }}>{t('brand.name')}</span>
              <span style={{ fontSize: '13px', color: 'var(--muted)', marginInlineStart: '12px' }}>
                {t('brand.slogan')}
              </span>
            </div>

            <div className="landing-footer-links">
              <button type="button" onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('landing.nav.features')}
              </button>
              <button type="button" onClick={() => scrollTo('preview')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('landing.nav.preview')}
              </button>
              <button type="button" onClick={() => scrollTo('roles')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('landing.nav.roles')}
              </button>
              <button type="button" onClick={() => scrollTo('pricing')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('landing.nav.pricing')}
              </button>
              <button type="button" onClick={() => scrollTo('faq')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('landing.nav.faq')}
              </button>
              <Link to="/login">{t('common.signIn')}</Link>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <div>
              <span>{t('common.allRightsReserved')}</span>
            </div>
            <div className="system-status-chip">
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)' }} />
              <span>{t('common.serversOperational')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------
          Interactive Quick Demo Modal
          ------------------------------------------------------------ */}
      {showDemoModal && (
        <div className="demo-modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="demo-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="demo-modal-close"
              onClick={() => setShowDemoModal(false)}
              aria-label={t('common.close')}
            >
              ✕
            </button>

            <div className="demo-modal-header">
              <span className="eyebrow" style={{ color: 'var(--blue)', fontSize: '12px' }}>{t('demo.eyebrow')}</span>
              <h3>{t('demo.title')}</h3>
              <p>{t('demo.desc')}</p>
            </div>

            <div className="demo-accounts-list">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.email}
                  className="demo-account-item"
                  onClick={() => handleQuickLogin(acc)}
                >
                  <div className="demo-account-info">
                    <Avatar name={acc.name} size={42} />
                    <div>
                      <strong style={{ fontSize: '14.5px', color: 'var(--navy)', display: 'block' }}>
                        {acc.name}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {acc.email} · {acc.dept}
                      </span>
                    </div>
                  </div>
                  <span className={`demo-account-role-badge role-badge--${acc.role}`}>
                    {acc.roleLabel} {arrow}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--muted)', borderTop: '1px solid #f0f3f9', paddingTop: '16px' }}>
              <span>{t('demo.hasAccount')} </span>
              <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                {t('demo.loginManual')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
