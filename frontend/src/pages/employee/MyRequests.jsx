import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { api } from '../../api/index.js';
import { Alert, Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader, SectionTitle } from '../../components/ui.jsx';
import { useApi } from '../../hooks/useApi.js';
import { REQUEST_LABELS, REQUEST_TONES, STATUS_LABELS, shortDate } from '../../utils/format.js';

const TYPES = [
  { key: 'leave', label: 'إجازة اعتيادية' },
  { key: 'advance', label: 'سلفة' },
  { key: 'certificate', label: 'شهادة راتب' },
  { key: 'overtime', label: 'عمل إضافي' },
];

const needsRange = (type) => type === 'leave' || type === 'overtime';

export default function MyRequests() {
  const location = useLocation();
  const initialType = TYPES.some((item) => item.key === location.state?.type)
    ? location.state.type
    : 'leave';

  const { data, loading, error, reload } = useApi(() => api.requests.mine());
  const [type, setType] = useState(initialType);
  const [form, setForm] = useState({ from: '', to: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      const result = await api.requests.create({
        type,
        from: needsRange(type) && form.from ? form.from : null,
        to: needsRange(type) && form.to ? form.to : null,
        note: form.note.trim(),
      });
      setNotice({ tone: 'success', text: result.message || 'تم إرسال الطلب' });
      setForm({ from: '', to: '', note: '' });
      await reload();
    } catch (requestError) {
      setNotice({ tone: 'error', text: requestError.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="طلباتي"
        subtitle="قدّم طلبًا جديدًا وتابع حالته لحظة بلحظة."
      />

      {notice ? <Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert> : null}

      <div className="grid grid--2">
        <Card className="card--pad">
          <SectionTitle hint="يصل للمدير مباشرة">
            طلب جديد
          </SectionTitle>

          <div className="chip-group chip-group--wrap">
            {TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`chip ${type === item.key ? 'is-active' : ''}`}
                onClick={() => setType(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {needsRange(type) ? (
              <div className="form__row">
                <label className="field">
                  <span>من</span>
                  <input
                    type="date"
                    value={form.from}
                    onChange={(event) => setForm({ ...form, from: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>إلى</span>
                  <input
                    type="date"
                    value={form.to}
                    onChange={(event) => setForm({ ...form, to: event.target.value })}
                  />
                </label>
              </div>
            ) : null}

            <label className="field">
              <span>ملاحظة للمدير</span>
              <textarea
                rows="4"
                placeholder="اكتب السبب أو أي تفاصيل إضافية…"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />
            </label>

            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
            </button>
          </form>
        </Card>

        <Card className="card--pad">
          <SectionTitle hint={`${data.requests.length} طلب`}>
            سجل الطلبات
          </SectionTitle>

          {data.requests.length === 0 ? (
            <EmptyState
              title="لا توجد طلبات بعد"
              description="أول طلب لك سيظهر هنا."
            />
          ) : (
            <div className="request-list">
              {data.requests.map((request) => (
                <div className="request-item" key={request.id}>
                  <div className="request-item__text">
                    <strong>{REQUEST_LABELS[request.type] || request.typeLabel}</strong>
                    <span>
                      {request.range || shortDate(request.createdAt, 'ar')}
                      {request.note ? ` · ${request.note}` : ''}
                    </span>
                  </div>
                  <Badge tone={REQUEST_TONES[request.status] || 'gray'}>
                    {STATUS_LABELS[request.status] || request.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
