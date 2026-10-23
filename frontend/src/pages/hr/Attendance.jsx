import { useState } from 'react';

import { api } from '../../api/index.js';
import { Badge, Card, ErrorState, LoadingState, PageHeader, Progress } from '../../components/ui.jsx';
import Table from '../../components/Table.jsx';
import { useApi } from '../../hooks/useApi.js';
import { STATUS_LABELS, STATUS_TONES } from '../../utils/format.js';

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const LEGEND = ['present', 'remote', 'late', 'absent', 'leave'];

export default function Attendance() {
  const [date, setDate] = useState(localToday);
  const { data, loading, error, reload } = useApi(() => api.attendance.daily(date), [date]);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const summary = data.summary || {
    present: 0,
    remote: 0,
    late: 0,
    absent: 0,
    leave: 0,
    total: 0,
  };
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const weekDays = Array.isArray(data.weekDays) ? data.weekDays : [];

  return (
    <>
      <PageHeader
        title="الحضور والانصراف"
        subtitle={data.dateLabel}
        actions={
          <div className="header-inline">
            <div className="headline-stats headline-stats--compact">
              <div>
                <span>حاضر</span>
                <strong className="text-green">{summary.present}</strong>
              </div>
              <div>
                <span>عن بُعد</span>
                <strong className="text-blue">{summary.remote}</strong>
              </div>
              <div>
                <span>متأخر</span>
                <strong className="text-amber">{summary.late}</strong>
              </div>
              <div>
                <span>غائب</span>
                <strong className="text-red">{summary.absent}</strong>
              </div>
            </div>

            <label className="field field--inline">
              <span>التاريخ</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
          </div>
        }
      />

      <div className="grid grid--3">
        <Card className="card--pad">
          <span className="mini-stat__label">نسبة الحضور الفعلي</span>
          <div className="mini-stat__row">
            <strong>{Math.round((summary.present / Math.max(1, summary.total)) * 100)}%</strong>
            <span>{summary.present} من {summary.total}</span>
          </div>
          <Progress value={(summary.present / Math.max(1, summary.total)) * 100} tone="green" />
        </Card>

        <Card className="card--pad">
          <span className="mini-stat__label">العمل عن بُعد</span>
          <div className="mini-stat__row">
            <strong>{summary.remote}</strong>
            <span>موظف مسجّل اليوم</span>
          </div>
          <Progress value={(summary.remote / Math.max(1, summary.total)) * 100} tone="blue" />
        </Card>

        <Card className="card--pad">
          <span className="mini-stat__label">استثناءات تحتاج متابعة</span>
          <div className="mini-stat__row">
            <strong>{summary.late + summary.absent}</strong>
            <span>تأخير وغياب</span>
          </div>
          <Progress
            value={((summary.late + summary.absent) / Math.max(1, summary.total)) * 100}
            tone="amber"
          />
        </Card>
      </div>

      <Card className="card--pad">
        <Table
          rows={rows}
          getKey={(row) => row.employee?.id}
          empty="لا توجد سجلات حضور في هذا اليوم"
          columns={[
            {
              key: 'employee',
              label: 'الموظف',
              width: '1.8fr',
              render: (row) => (
                <div className="cell-person">
                  <strong>{row.employee?.name}</strong>
                  <span dir="ltr">{row.employee?.code}</span>
                </div>
              ),
            },
            {
              key: 'dept',
              label: 'القسم',
              width: '1.2fr',
              render: (row) => <span className="muted">{row.employee?.dept}</span>,
            },
            {
              key: 'checkIn',
              label: 'دخول',
              width: '0.9fr',
              number: true,
              render: (row) => <span dir="ltr">{row.record?.checkIn || '—'}</span>,
            },
            {
              key: 'checkOut',
              label: 'انصراف',
              width: '0.9fr',
              number: true,
              render: (row) => <span dir="ltr">{row.record?.checkOut || '—'}</span>,
            },
            {
              key: 'hours',
              label: 'ساعات',
              width: '0.8fr',
              number: true,
              render: (row) => (row.record?.hours ?? '—'),
            },
            {
              key: 'status',
              label: 'الحالة',
              width: '1fr',
              render: (row) => (
                <Badge tone={STATUS_TONES[row.record?.status] || 'gray'}>
                  {STATUS_LABELS[row.record?.status] || row.record?.statusLabel || '—'}
                </Badge>
              ),
            },
            {
              key: 'week',
              label: 'الأسبوع (أحد ← خميس)',
              width: '1.6fr',
              render: (row) => (
                <div className="week-strip">
                  {(row.week || []).map((status, index) => (
                    <span
                      key={`${row.employee?.id}-${index}`}
                      className={`week-cell week-cell--${status || 'none'}`}
                      title={weekDays[index]?.label || ''}
                    />
                  ))}
                </div>
              ),
            },
          ]}
        />

        <div className="legend">
          {LEGEND.map((status) => (
            <span className="legend__item" key={status}>
              <i className={`week-cell week-cell--${status}`} />
              {STATUS_LABELS[status]}
            </span>
          ))}
        </div>
      </Card>
    </>
  );
}
