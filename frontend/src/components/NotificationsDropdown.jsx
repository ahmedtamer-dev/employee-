import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Icons = {
  bell: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  ),
  check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  trash: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  payslip: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  leave: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
    </svg>
  ),
  clock: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  approval: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  hiring: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
    </svg>
  ),
};

const INITIAL_NOTIFICATIONS = {
  emp: [
    {
      id: 'notif-e1',
      title: 'إيداع قسيمة الراتب',
      body: 'تم إيداع مسير راتب شهر أكتوبر في حسابك البنكي بنجاح.',
      time: 'منذ ساعتين',
      read: false,
      tone: 'green',
      icon: 'payslip',
      to: '/payslip',
    },
    {
      id: 'notif-e2',
      title: 'الموافقة على طلب الإجازة',
      body: 'وافق قسم الموارد البشرية على طلب إجازتك الاعتيادية (3 أيام).',
      time: 'منذ 5 ساعات',
      read: false,
      tone: 'blue',
      icon: 'leave',
      to: '/requests',
    },
    {
      id: 'notif-e3',
      title: 'تذكير بموعد الانصراف',
      body: 'تذكير: لم تسجل انصرافك بعد، دوام العمل شارف على الانتهاء.',
      time: 'منذ 15 دقيقة',
      read: false,
      tone: 'amber',
      icon: 'clock',
      to: '/home',
    },
    {
      id: 'notif-e4',
      title: 'إعلان: وثيقة التأمين الطبي',
      body: 'تبدأ التغطية الصحية الجديدة لكافة الموظفين من أول الشهر القادم.',
      time: 'أمس',
      read: true,
      tone: 'purple',
      icon: 'bell',
    },
  ],
  hr: [
    {
      id: 'notif-h1',
      title: 'طلب إجازة جديد معلّق',
      body: 'قدّمت سارة نبيل طلب إجازة سنوية لمدة 4 أيام بانتظار موافقتك.',
      time: 'منذ 20 دقيقة',
      read: false,
      tone: 'amber',
      icon: 'leave',
      to: '/leaves',
    },
    {
      id: 'notif-h2',
      title: 'تنبيه تأخير وحضور اليوم',
      body: 'تم رصد 2 موظفين متأخرين عن موعد الدوام الصباحي (09:00 ص).',
      time: 'اليوم 09:35 ص',
      read: false,
      tone: 'red',
      icon: 'clock',
      to: '/attendance',
    },
    {
      id: 'notif-h3',
      title: 'مقابلة توظيف مجدولة',
      body: 'لديك مقابلة مع المرشح كريم عادل (مصمم واجهات) غداً 11:00 ص.',
      time: 'اليوم',
      read: false,
      tone: 'blue',
      icon: 'hiring',
      to: '/hiring',
    },
    {
      id: 'notif-h4',
      title: 'جاهزية مسير الرواتب',
      body: 'تم استكمال 4 من أصل 5 بنود في قائمة مراجعة رواتب الشهر.',
      time: 'أمس',
      read: true,
      tone: 'green',
      icon: 'payslip',
      to: '/payroll',
    },
  ],
  mgmt: [
    {
      id: 'notif-m1',
      title: 'اعتماد مسير الرواتب مطلوب',
      body: 'تم تجهيز مسير رواتب أكتوبر (340,000 ج.م) بانتظار مصادقتك.',
      time: 'منذ ساعة',
      read: false,
      tone: 'amber',
      icon: 'approval',
      to: '/payroll',
    },
    {
      id: 'notif-m2',
      title: 'تقرير نسبة حضور اليوم',
      body: 'نسبة الحضور الإجمالية في الشركة بلغت 94% اليوم (أداء ممتاز).',
      time: 'اليوم 10:00 ص',
      read: false,
      tone: 'green',
      icon: 'clock',
      to: '/dashboard',
    },
    {
      id: 'notif-m3',
      title: 'طلب اعتماد مكافأة أداء',
      body: 'تم ترشيح قسم الهندسة لمكافأة الأداء الاستثنائي للربع الثالث.',
      time: 'أمس',
      read: false,
      tone: 'blue',
      icon: 'approval',
      to: '/dashboard',
    },
    {
      id: 'notif-m4',
      title: 'تحديث تقييمات الأداء (KPIs)',
      body: 'تم تحديث تقارير إنجاز الأهداف الاستراتيجية لجميع الأقسام.',
      time: 'أمس',
      read: true,
      tone: 'purple',
      icon: 'bell',
      to: '/kpis',
    },
  ],
};

export default function NotificationsDropdown({ role = 'emp' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const containerRef = useRef(null);

  // Load notifications for role
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(`nasaq_notifs_${role}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_NOTIFICATIONS[role] || INITIAL_NOTIFICATIONS.emp;
  });

  // Save changes
  useEffect(() => {
    localStorage.setItem(`nasaq_notifs_${role}`, JSON.stringify(items));
  }, [items, role]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const unreadCount = items.filter((item) => !item.read).length;

  const markAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markSingleAsRead = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const deleteNotification = (e, id) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNotificationClick = (item) => {
    markSingleAsRead(item.id);
    if (item.to) {
      navigate(item.to);
      setOpen(false);
    }
  };

  const visibleItems = items.filter((item) => (filter === 'unread' ? !item.read : true));

  const renderIcon = (iconType, tone = 'blue') => {
    const IconComp = Icons[iconType] || Icons.bell;
    return (
      <div className={`notif-icon notif-icon--${tone}`}>
        <IconComp />
      </div>
    );
  };

  return (
    <div className="notif-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`icon-btn ${unreadCount > 0 ? 'icon-btn--dot' : ''}`}
        title={`التنبيهات (${unreadCount} غير مقروءة)`}
        aria-label="التنبيهات"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icons.bell />
        {unreadCount > 0 ? (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="notif-dropdown" role="dialog" aria-label="مركز التنبيهات">
          {/* Header */}
          <div className="notif-dropdown__header">
            <div className="notif-header__title">
              <strong>التنبيهات</strong>
              {unreadCount > 0 ? (
                <span className="notif-header__count">{unreadCount} جديد</span>
              ) : null}
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="notif-header__mark-all"
                onClick={markAllAsRead}
                title="تحديد الكل كمقروء"
              >
                <Icons.check />
                <span>قراءة الكل</span>
              </button>
            ) : null}
          </div>

          {/* Filter Pills */}
          <div className="notif-dropdown__tabs">
            <button
              type="button"
              className={`notif-tab ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              الكل ({items.length})
            </button>
            <button
              type="button"
              className={`notif-tab ${filter === 'unread' ? 'is-active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              غير المقروءة ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className="notif-dropdown__list">
            {visibleItems.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty__icon">✨</div>
                <p>
                  {`لا توجد تنبيهات ${filter === 'unread' ? 'غير مقروءة' : 'جديدة'} حالياً`}
                </p>
              </div>
            ) : (
              visibleItems.map((item) => (
                <div
                  key={item.id}
                  className={`notif-item ${item.read ? 'is-read' : 'is-unread'}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  {renderIcon(item.icon, item.tone)}

                  <div className="notif-item__body">
                    <div className="notif-item__top">
                      <strong className="notif-item__title">{item.title}</strong>
                      <span className="notif-item__time">{item.time}</span>
                    </div>
                    <p className="notif-item__text">{item.body}</p>
                  </div>

                  <div className="notif-item__side">
                    {!item.read ? <span className="notif-item__unread-dot" /> : null}
                    <button
                      type="button"
                      className="notif-item__remove-btn"
                      onClick={(e) => deleteNotification(e, item.id)}
                      title="حذف التنبيه"
                    >
                      <Icons.trash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notif-dropdown__footer">
            <span>تحديث لحظي للتنبيهات والمهام</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
