import { useState } from 'react';

import { Avatar, Badge } from './ui.jsx';
import Modal from './Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_META } from '../config/navigation.js';

export default function ProfileModal({ open, onClose, onSaveSuccess }) {
  const { user } = useAuth();

  const role = user?.role || 'emp';
  const roleLabel = ROLE_META[role]?.label || 'موظف';

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security' | 'meta'
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '01012345678',
    dept: user?.dept || 'التصميم والتقنية',
    role: user?.roleTitle || (role === 'hr' ? 'مسؤول موارد بشرية' : role === 'mgmt' ? 'مدير تنفيذي' : 'مصمم واجهات'),
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    setTimeout(() => {
      setSaving(false);
      setNotice({
        tone: 'success',
        text: 'تم تحديث البيانات الشخصية بنجاح',
      });
      onSaveSuccess?.('تم تحديث البيانات الشخصية');
    }, 400);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setNotice(null);

    if (!passwordData.currentPassword) {
      setNotice({
        tone: 'error',
        text: 'يرجى إدخال كلمة المرور الحالية',
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setNotice({
        tone: 'error',
        text: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف',
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotice({
        tone: 'error',
        text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين',
      });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice({
        tone: 'success',
        text: 'تم تغيير كلمة المرور بنجاح',
      });
      onSaveSuccess?.('تم تغيير كلمة المرور بنجاح');
    }, 450);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="الملف الشخصي والحساب"
      subtitle="إدارة بياناتك، تفاصيل الاتصال، وأمان كلمة المرور"
      size="md"
    >
      <div className="profile-modal">
        {/* Profile Header Card */}
        <div className="profile-modal__hero">
          <Avatar name={user?.name || ''} size={60} square />
          <div className="profile-modal__meta">
            <div className="profile-modal__name-row">
              <strong>{user?.name || 'المستخدم'}</strong>
              <Badge tone="blue">{roleLabel}</Badge>
            </div>
            <span className="profile-modal__email" dir="ltr">
              {user?.email || 'user@nasaq.hr'}
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="profile-modal__tabs">
          <button
            type="button"
            className={`profile-tab ${activeTab === 'info' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab('info');
              setNotice(null);
            }}
          >
            البيانات الشخصية
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'security' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab('security');
              setNotice(null);
            }}
          >
            الأمان وكلمة المرور
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'meta' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab('meta');
              setNotice(null);
            }}
          >
            معلومات الحساب
          </button>
        </div>

        {notice ? (
          <div className={`alert alert--${notice.tone}`} style={{ margin: '14px 0 6px' }}>
            {notice.text}
          </div>
        ) : null}

        {/* Tab 1: Personal Info */}
        {activeTab === 'info' ? (
          <form className="form" onSubmit={handleSaveInfo} style={{ marginTop: 14 }}>
            <label className="field">
              <span>الاسم الكامل</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </label>

            <div className="form__row">
              <label className="field">
                <span>المسمى الوظيفي</span>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled
                />
              </label>

              <label className="field">
                <span>القسم</span>
                <input
                  type="text"
                  value={formData.dept}
                  onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                  disabled
                />
              </label>
            </div>

            <div className="form__row">
              <label className="field">
                <span>رقم الهاتف للتواصل</span>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </label>

              <label className="field">
                <span>البريد الإلكتروني</span>
                <input
                  type="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
              {saving ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
            </button>
          </form>
        ) : null}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' ? (
          <form className="form" onSubmit={handleSavePassword} style={{ marginTop: 14 }}>
            <label className="field">
              <span>كلمة المرور الحالية</span>
              <input
                type="password"
                dir="ltr"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </label>

            <div className="form__row">
              <label className="field">
                <span>كلمة المرور الجديدة</span>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="لا تقل عن 6 أحرف"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span>تأكيد كلمة المرور الجديدة</span>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="أعد كتابة الكلمة"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
              {saving ? 'جارٍ التحديث…' : 'تحديث كلمة المرور'}
            </button>
          </form>
        ) : null}

        {/* Tab 3: Account Meta */}
        {activeTab === 'meta' ? (
          <div className="profile-modal__meta-list" style={{ marginTop: 16 }}>
            <div className="meta-item">
              <span className="meta-item__label">حالة الحساب</span>
              <Badge tone="green">نشط ومفعل</Badge>
            </div>
            <div className="meta-item">
              <span className="meta-item__label">مستوى الصلاحية</span>
              <span className="meta-item__val">{roleLabel} ({role.toUpperCase()})</span>
            </div>
            <div className="meta-item">
              <span className="meta-item__label">نظام التشغيل والتسجيل</span>
              <span className="meta-item__val">NASAQS Enterprise v1.0</span>
            </div>
            <div className="meta-item">
              <span className="meta-item__label">آخر تسجيل دخول</span>
              <span className="meta-item__val" dir="ltr">اليوم، 09:00 ص</span>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
