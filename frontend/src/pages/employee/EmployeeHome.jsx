import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { api } from '../../api/index.js';
import { Alert, Badge, Card, ErrorState, LoadingState, PageHeader, Progress, Ring, SectionTitle, Stat } from '../../components/ui.jsx';
import { useApi, useInterval } from '../../hooks/useApi.js';
import { LEAVE_LABELS, STATUS_LABELS, STATUS_TONES, fullDate, money, shortDate } from '../../utils/format.js';

const pad = (value) => String(value).padStart(2, '0');

const minutesSince = (clock) => {
  if (!clock) return 0;
  const [hours, minutes] = clock.split(':').map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const diff = Math.floor((Date.now() - start.getTime()) / 60000);
  return Math.max(0, diff);
};

const QUICK_ACTIONS = [
  { label: 'طلب إجازة', type: 'leave' },
  { label: 'طلب سلفة', type: 'advance' },
  { label: 'شهادة راتب', type: 'certificate' },
  { label: 'عمل إضافي', type: 'overtime' },
];

export default function EmployeeHome() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(() => api.dashboard.employee());
  const [now, setNow] = useState(new Date());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useInterval(() => setNow(new Date()), 1000);

  const liveMinutes = useMemo(() => {
    if (!data?.today) return 0;
    if (data.today.checkIn && !data.today.checkOut) {
      return Math.max(data.today.elapsedMinutes, minutesSince(data.today.checkIn));
    }
    return data.today.elapsedMinutes || 0;
  }, [data, now]);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const firstName = data.employee.name.split(' ')[0];
  const annualBalance = data.balances.find((balance) => balance.key === 'annual');
  const maxHours = Math.max(8.5, ...data.week.map((day) => day.hours || 0));

  const clockLabel = `${pad(Math.floor(liveMinutes / 60))}:${pad(liveMinutes % 60)}`;
  const ringProgress = Math.min(1, liveMinutes / 480);

  const attendanceAction = async () => {
    if (!data.today.checkIn) return api.attendance.checkIn();
    if (!data.today.checkOut) return api.attendance.checkOut();
    return null;
  };

  const handleAttendance = async () => {
    if (busy || (data.today.checkIn && data.today.checkOut)) return;

    setBusy(true);
    setNotice(null);
    try {
      const result = await attendanceAction();
      setNotice({ tone: 'success', text: result?.message || 'تم تحديث سجل الحضور' });
      await reload();
    } catch (actionError) {
      setNotice({ tone: 'error', text: actionError.message });
    } finally {
      setBusy(false);
    }
  };

  const attendanceLabel = !data.today.checkIn
    ? 'تسجيل حضور'
    : data.today.checkOut
      ? 'اكتمل اليوم ✓'
      : 'تسجيل انصراف';

  return (
    <>
      <PageHeader
        title={`أهلاً، ${firstName}`}
        subtitle={`${fullDate(data.today.date)} · إليك ملخص يومك في نسق`}
        actions={
          <div className="headline-stats">
            <div>
              <span>ساعات هذا الأسبوع</span>
              <strong>{data.hoursThisWeek}</strong>
            </div>
            <div>
              <span>رصيد الإجازات</span>
              <strong>
                {annualBalance?.remaining ?? 0}
                <small> يوم</small>
              </strong>
            </div>
            <div>
              <span>طلبات معلّقة</span>
              <strong>{data.pendingRequests}</strong>
            </div>
          </div>
        }
      />

      {notice ? <Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert> : null}

      <div className="grid grid--4">
        <Card className="card--pad attendance-card">
          <SectionTitle hint={<Badge tone={data.today.checkIn ? 'green' : 'gray'}>{data.today.checkIn ? `دخول ${data.today.checkIn}` : 'لم يُسجَّل'}</Badge>}>
            تسجيل الحضور
          </SectionTitle>

          <div className="attendance-card__ring">
            <Ring progress={ringProgress} size={168}>
              <div className="ring__clock" dir="ltr">
                {clockLabel}
              </div>
              <span className="ring__hint">من 08:00 · 8 ساعات</span>
            </Ring>
          </div>

          <div className="attendance-card__meta">
            <span>
              الحالة: <strong>{STATUS_LABELS[data.today.status] || data.today.statusLabel}</strong>
            </span>
            <span>
              الانصراف: <strong dir="ltr">{data.today.checkOut || '—'}</strong>
            </span>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={handleAttendance}
            disabled={busy || (data.today.checkIn && data.today.checkOut)}
          >
            {busy ? 'جارٍ التسجيل…' : attendanceLabel}
          </button>
        </Card>

        <Card className="card--pad">
          <SectionTitle hint="هذا الأسبوع">ساعات العمل</SectionTitle>
          <div className="hours-card__value">
            <strong>{data.hoursThisWeek}</strong>
            <span>
              ساعة
              <br />
              أسبوعيًا
            </span>
          </div>

          <div className="bars">
            {data.week.map((day) => {
              const height = Math.max(6, Math.round(((day.hours || 0) / maxHours) * 96));
              return (
                <div className={`bar ${day.isToday ? 'is-today' : ''}`} key={day.date}>
                  {day.isToday ? <span className="bar__tip">{day.hours ?? 0} س</span> : null}
                  <span
                    className={`bar__fill ${day.hours ? '' : 'is-empty'} ${day.isToday ? 'is-today' : ''}`}
                    style={{ height }}
                  />
                  <small>{day.shortLabel}</small>
                </div>
              );
            })}
          </div>
        </Card>

        <Card tone="navy" className="payslip-card">
          <div className="payslip-card__head">
            <SectionTitle>قسيمة الراتب</SectionTitle>
            <Badge tone="glass">{data.payslip.label || 'الشهر الحالي'}</Badge>
          </div>

          <div className="payslip-card__amount">
            <span>صافي الراتب</span>
            <strong>
              {data.payslip.net ? money(data.payslip.net) : '—'}
              <small> ج.م</small>
            </strong>
            <span className="payslip-card__hint">
              {data.payslip.payDate ? `تاريخ الصرف: ${shortDate(data.payslip.payDate)}` : 'لم يُعتمد المسيّر بعد'}
            </span>
          </div>

          <div className="payslip-card__split">
            <span style={{ flex: 83 }} />
            <span style={{ flex: 17 }} />
          </div>

          <Link to="/payslip" className="btn btn--light btn--block">
            عرض تفاصيل القسيمة
          </Link>
        </Card>

        <Card className="card--pad quick-card">
          <SectionTitle>وصول سريع</SectionTitle>
          <div className="quick-list">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.type}
                type="button"
                className="quick-list__item"
                onClick={() => navigate('/requests', { state: { type: action.type } })}
              >
                <span>{action.label}</span>
                <span aria-hidden="true">←</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="card--pad span-2">
          <SectionTitle hint="آخر تقييم">مؤشرات أدائي</SectionTitle>
          <div className="kpi-list">
            {data.kpis.map((kpi) => (
              <div className="kpi-row" key={kpi.id}>
                <span className="kpi-row__name">{kpi.name}</span>
                <Progress value={kpi.progress} tone={kpi.progress >= 90 ? 'green' : 'blue'} />
                <span className="kpi-row__value">{kpi.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card--pad">
          <SectionTitle hint="حتى اليوم">أرصدة الإجازات</SectionTitle>
          <div className="balance-list">
            {data.balances.map((balance) => (
              <div className="balance" key={balance.key}>
                <div className="balance__head">
                  <span>{LEAVE_LABELS[balance.key] || balance.label}</span>
                  <span>
                    {balance.used} / {balance.total} يوم
                  </span>
                </div>
                <Progress
                  value={balance.percent}
                  tone={balance.key === 'annual' ? 'blue' : balance.key === 'casual' ? 'navy' : 'sky'}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="card--pad">
          <SectionTitle>لوحة الإعلانات</SectionTitle>
          <div className="announcement-list">
            {data.announcements.map((announcement) => (
              <div
                className={`announcement ${announcement.pinned ? 'is-pinned' : ''}`}
                key={announcement.id}
              >
                <strong>{announcement.title}</strong>
                <span>{announcement.body}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="status-strip">
        <Stat label="حالة اليوم" value={STATUS_LABELS[data.today.status] || 'غير مسجّل'} />
        <span className={`status-dot status-dot--${STATUS_TONES[data.today.status] || 'gray'}`} />
        <span className="status-strip__hint">
          يتم تحديث ساعات العمل تلقائيًا لحظة تسجيل الحضور والانصراف.
        </span>
      </div>
    </>
  );
}
