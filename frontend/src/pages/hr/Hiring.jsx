import { useState } from 'react';

import { api } from '../../api/index.js';
import { Alert, Avatar, Badge, Card, ErrorState, LoadingState, PageHeader } from '../../components/ui.jsx';
import Modal from '../../components/Modal.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function Hiring() {
  const { data, loading, error, reload, setData } = useApi(() => api.recruitment.board());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', title: '' });
  const [busyId, setBusyId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const moveNext = async (candidate) => {
    setBusyId(candidate.id);
    setNotice(null);
    try {
      const result = await api.recruitment.setStage(candidate.id, candidate.stage + 1);
      setData(result.board);
      setNotice({ tone: 'success', text: result.message });
    } catch (moveError) {
      setNotice({ tone: 'error', text: moveError.message });
    } finally {
      setBusyId(null);
    }
  };

  const addCandidate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const result = await api.recruitment.addCandidate({
        name: form.name.trim(),
        title: form.title.trim(),
      });
      setData(result.board);
      setForm({ name: '', title: '' });
      setModalOpen(false);
      setNotice({ tone: 'success', text: result.message });
    } catch (addError) {
      setNotice({ tone: 'error', text: addError.message });
    } finally {
      setSaving(false);
    }
  };

  const columns = Array.isArray(data?.columns) ? data.columns : [];
  const totalCount = data?.total ?? columns.reduce((s, c) => s + (c.count || 0), 0);

  return (
    <>
      <PageHeader
        title="التوظيف"
        subtitle={`${totalCount} مرشحًا على اللوحة · اضغط «المرحلة التالية» لنقل المرشح`}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            + مرشح جديد
          </button>
        }
      />

      {notice ? <Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert> : null}

      <div className="kanban">
        {columns.map((column) => (
          <Card className="kanban__column" key={column.stage}>
            <div className="kanban__head">
              <span>{column.title}</span>
              <Badge tone="gray">{column.count}</Badge>
            </div>

            <div className="kanban__cards">
              {column.items.map((candidate) => (
                <div className="kanban__card" key={candidate.id}>
                  <div className="kanban__person">
                    <Avatar name={candidate.name} size={36} square />
                    <div>
                      <strong>{candidate.name}</strong>
                      <span>{candidate.title}</span>
                    </div>
                  </div>

                  {candidate.canMove ? (
                    <button
                      type="button"
                      className="btn btn--soft btn--sm btn--block"
                      onClick={() => moveNext(candidate)}
                      disabled={busyId === candidate.id}
                    >
                      {busyId === candidate.id ? 'جارٍ النقل…' : 'المرحلة التالية ←'}
                    </button>
                  ) : (
                    <Badge tone="green">تم التعيين</Badge>
                  )}
                </div>
              ))}

              {column.items.length === 0 ? (
                <span className="kanban__empty">لا يوجد مرشحون</span>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        title="مرشح جديد"
        subtitle="أضف مرشحًا إلى أول مرحلة في مسار التوظيف."
        onClose={() => setModalOpen(false)}
      >
        <form className="form" onSubmit={addCandidate}>
          <label className="field">
            <span>اسم المرشح</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="مثال: مريم أحمد"
              required
            />
          </label>

          <label className="field">
            <span>الوظيفة</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="مثال: مصممة UX"
              required
            />
          </label>

          <div className="form__actions">
            <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'جارٍ الإضافة…' : 'إضافة المرشح'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
