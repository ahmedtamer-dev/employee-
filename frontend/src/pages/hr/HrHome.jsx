import { useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../../api/index.js';
import { Alert, Badge, Card, ErrorState, LoadingState, PageHeader, Progress, SectionTitle } from '../../components/ui.jsx';
import { useApi } from '../../hooks/useApi.js';
import { STATUS_LABELS, STATUS_TONES } from '../../utils/format.js';

const formatTime = (time) => {
  if (!time) return '—';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'م' : 'ص';
  const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

export default function HrHome() {
  const { data, loading, error, reload, setData } = useApi(() => api.dashboard.hr());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const toggleReadiness = async (item) => {
    try {
      const result = await api.dashboard.toggleChecklist('payrollReadiness', item.id);
      setData((previous) => ({
        ...previous,
        readiness: result.items,
        readinessDone: result.done,
      }));
    } catch (toggleError) {
      setNotice({ tone: 'error', text: toggleError.message });
    }
  };

  const submitToFinance = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const remaining = data.readiness.filter((item) => !item.done);
      for (const item of remaining) {
        await api.dashboard.toggleChecklist('payrollReadiness', item.id);
      }
      await reload();
      setNotice({
        tone: 'success',
        text: remaining.length
          ? 'تم استكمال كل بنود الرواتب وإرسالها للاعتماد المالي'
          : 'كل البنود مكتملة بالفعل',
      });
    } catch (submitError) {
      setNotice({ tone: 'error', text: submitError.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`أهلاً، ${data.greetingName}`}
        subtitle={`لوحة الموارد البشرية · ${data.attentionCount} مهام تحتاج انتباهك اليوم`}
        actions={
          <div className="headline-stats">
            <div>
              <span>إجمالي الموظفين</span>
              <strong>{data.totalEmployees}</strong>
            </div>
            <div>
              <span>وظائف شاغرة</span>
              <strong>{data.openPositions}</strong>
            </div>
            <div>
              <span>معدل الدوران</span>
              <strong>
                {data.turnover}
                <small>%</small>
              </strong>
            </div>
          </div>
        }
      />

      {notice ? <Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert> : null}

      <div className="grid grid--4">
        <Card className="card--pad span-2">
          <SectionTitle
            action={
              <Link to="/hiring" className="btn btn--soft btn--sm">
                فتح لوحة التوظيف
              </Link>
            }
          >
            مسار التوظيف · الشهر الحالي
          </SectionTitle>

          <div className="funnel">
            {data.funnel.map((item) => (
              <div className="funnel__row" key={item.key}>
                <span className="funnel__label">{item.label}</span>
                <div
                  className={`funnel__bar funnel__bar--${item.tone}`}
                  style={{ width: `${item.percent}%` }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card--pad">
          <SectionTitle hint={`${data.interviews.length} مقابلات`}>
            مقابلات اليوم
          </SectionTitle>
          <div className="simple-list">
            {data.interviews.map((interview) => (
              <div className="simple-row" key={interview.id}>
                <span className="time-tag" dir="ltr">
                  {formatTime(interview.time)}
                </span>
                <div>
                  <strong>{interview.name}</strong>
                  <span>{interview.role}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card tone="navy" className="readiness-card row-2">
          <div className="readiness-card__head">
            <SectionTitle>جاهزية رواتب الشهر</SectionTitle>
            <strong className="readiness-card__count">
              {data.readinessDone}/{data.readinessTotal}
            </strong>
          </div>
          <span className="readiness-card__date">
            الإقفال يوم {data.closingDate}
          </span>

          <div className="checklist">
            {data.readiness.map((item) => (
              <button
                type="button"
                className="checklist__item"
                key={item.id}
                onClick={() => toggleReadiness(item)}
              >
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.sub}</span>
                </div>
                <span className={`check ${item.done ? 'is-done' : ''}`}>{item.done ? '✓' : ''}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn--light btn--block readiness-card__action"
            onClick={submitToFinance}
            disabled={busy}
          >
            {busy ? 'جارٍ الإرسال…' : 'إرسال للاعتماد المالي'}
          </button>
        </Card>

        <Card className="card--pad">
          <SectionTitle hint={`${data.exceptions.length} استثناء`}>
            استثناءات الحضور اليوم
          </SectionTitle>
          {data.exceptions.length ? (
            <div className="simple-list">
              {data.exceptions.map((exception) => (
                <div className="simple-row simple-row--spread" key={exception.id}>
                  <div>
                    <strong>{exception.name}</strong>
                    <span>
                      {exception.dept} · دخول {exception.in}
                    </span>
                  </div>
                  <Badge tone={STATUS_TONES[exception.status] || 'gray'}>
                    {STATUS_LABELS[exception.status] || exception.statusLabel}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">لا توجد استثناءات حتى الآن.</p>
          )}
        </Card>

        <Card className="card--pad">
          <SectionTitle hint={`${data.onboarding.length} موظف`}>
            موظفون جدد قيد التهيئة
          </SectionTitle>
          <div className="balance-list">
            {data.onboarding.map((item) => (
              <div className="balance" key={item.id}>
                <div className="balance__head">
                  <span>
                    <strong>{item.name}</strong> · {item.role}
                  </span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="card--pad">
          <SectionTitle hint="خلال 30 يومًا">
            مستندات وعقود تنتهي قريبًا
          </SectionTitle>
          <div className="simple-list">
            {data.expiring.map((document) => (
              <div className="simple-row simple-row--spread" key={document.id}>
                <div>
                  <strong>{document.kind}</strong>
                  <span>{document.employeeName}</span>
                </div>
                <Badge tone="amber">{document.dueLabel}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
