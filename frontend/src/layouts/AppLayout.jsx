import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import GlobalSearchModal from '../components/GlobalSearchModal.jsx';
import NotificationsDropdown from '../components/NotificationsDropdown.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
import { Avatar } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getNavItems, getRoleMeta } from '../config/navigation.js';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
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
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </svg>
);

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('nasaq_theme') || 'light');

  const role = user?.role || 'emp';
  const meta = getRoleMeta(role);
  const navItems = getNavItems(role);

  // Sync theme with html attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nasaq_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast({
      title: next === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح',
      text: next === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري',
      tone: 'info',
      duration: 2000,
    });
  };

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open search anywhere
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="topbar">
          <div className="topbar__side topbar__side--start">
            <NavLink to={meta.home} className="brand" aria-label="نسق">
              <span className="brand__mark" />
              <span className="brand__name">نسق</span>
            </NavLink>
            <span className="brand__role">{meta.label}</span>
          </div>

          <nav className="nav" aria-label="التنقل الرئيسي">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="topbar__side topbar__side--end">
            {/* Search Button */}
            <button
              type="button"
              className="icon-btn"
              title="البحث السريع (Ctrl+K)"
              aria-label="البحث"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>

            {/* Notification Center */}
            <NotificationsDropdown role={role} />

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              aria-label="تبديل المظهر"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* User Profile Chip (Clickable) */}
            <div
              className="user-chip user-chip--clickable"
              onClick={() => setProfileOpen(true)}
              title="عرض وتعديل الملف الشخصي"
              role="button"
              tabIndex={0}
            >
              <Avatar name={user?.name || ''} size={38} />
              <div className="user-chip__meta">
                <span>{user?.name}</span>
                <small>{meta.label}</small>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="icon-btn icon-btn--logout"
              onClick={handleLogout}
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogoutIcon />
            </button>
          </div>
        </header>

        <main className="page" key={location.pathname}>
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>نسق © 2026 · نظام إدارة الموارد البشرية الذكي</span>
          <span className="app-footer__dot" />
          <span>جميع الخوادم تعمل بكفاءة</span>
        </footer>
      </div>

      {/* مودال البحث الشامل */}
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* مودال الملف الشخصي والأمان */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSaveSuccess={(msg) => showToast({ title: 'الحساب', text: msg, tone: 'success' })}
      />
    </div>
  );
}

