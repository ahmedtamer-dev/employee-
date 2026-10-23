import { useEffect, useState } from 'react';

import { api } from '../../api/index.js';
import { Alert, Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui.jsx';
import Table from '../../components/Table.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { exportToCsv } from '../../utils/export.js';
import { money, payrollTone, shortDate } from '../../utils/format.js';

export default function Payroll() {
  const { showToast } = useToast();
  const { data, loading, error, reload } = useApi(() => api.payroll.runs());
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const runs = data?.runs || [];
  const run = runs.find((item) => item.id === selectedId) || runs[0] || null;

  useEffect(() => {
    if (runs.length && !runs.some((item) => item.id === selectedId)) {
      setSelectedId(runs[0].id);
    }
  }, [runs, selectedId]);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  if (!run) {
    return (
      <>
        <PageHeader
          title="الرواتب"
          subtitle="لا يوجد مسيّر رواتب بعد"
        />
        <Card className="card--pad">
          <EmptyState
            title="لم يتم إنشاء مسيّر رواتب"
            description="أنشئ مسيّر الشهر من الـ API ثم أعد التحميل."
          />
        </Card>
      </>
    );
  }

  const approve = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const result = await api.payroll.approve(run.id);
      setNotice({ tone: 'success', text: result.message });
      await reload();
    } catch (approveError) {
      setNotice({ tone: 'error', text: approveError.message });
    } finally {
      setBusy(false);
    }
  };

  const handleExportPayrollCsv = () => {
    if (!run?.items?.length) return;
    exportToCsv(
      `مسير_رواتب_${run.label.replace(/\s+/g, '_')}`,
      run.items,
      [
        { key: 'code', label: 'كود الموظف', value: (item) => item.employee?.code || '' },
        { key: 'name', label: 'اسم الموظف', value: (item) => item.employee?.name || '' },
        { key: 'role', label: 'المسمى الوظيفي', value: (item) => item.employee?.role || '' },
        { key: 'base', label: 'الراتب الأساسي', value: (item) => item.base || 0 },
        { key: 'allowances', label: 'إجمالي البدلات', value: (item) => item.allowances || 0 },
        { key: 'deductions', label: 'الاستقطاعات', value: (item) => item.deductions || 0 },
        { key: 'net', label: 'صافي الراتب المستحق', value: (item) => item.net || 0 },
        { key: 'bank', label: 'الحساب البنكي', value: (item) => item.bank || '' },
      ],
    );
    showToast({
      title: 'تصدير الرواتب',
      text: `تم تصدير مسير ${run.label} (${run.items.length} موظف) كملف Excel / CSV بنجاح`,
      tone: 'success',
    });
  };

  const runTotals = run?.totals || {
    count: run?.employeeCount || run?.items?.length || 0,
    net: run?.totalAmount || 0,
    base: Math.round((run?.totalAmount || 0) * 0.8),
    allowances: Math.round((run?.totalAmount || 0) * 0.15),
    deductions: Math.round((run?.totalAmount || 0) * 0.1),
  };
  const runItems = Array.isArray(run?.items) ? run.items : [];

  return (
    <>
      <PageHeader
        title={`مسيّر رواتب ${run.label || 'الشهر'}`}
        subtitle={`تاريخ الصرف: ${shortDate(run.payDate || new Date().toISOString())} · ${runTotals.count} موظف · ${run.statusLabel || 'معتمد'}`}
        actions={
          <div className="header-inline">
            {runs.length > 1 ? (
              <label className="field field--inline">
                <span>الشهر</span>
                <select value={run.id} onChange={(event) => setSelectedId(event.target.value)}>
                  {runs.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <button
              type="button"
              className="btn btn--outline"
              onClick={handleExportPayrollCsv}
              title="تصدير كشف مسير الرواتب كملف Excel"
            >
              📥 تصدير المسير
            </button>

            <button
              type="button"
              className={`btn ${run.status === 'approved' ? 'btn--success' : 'btn--primary'}`}
              onClick={approve}
              disabled={busy || run.status === 'approved'}
            >
              {run.status === 'approved'
                ? 'تم الاعتماد ✓'
                : busy
                ? 'جارٍ الاعتماد…'
                : 'اعتماد وصرف الرواتب'}
            </button>
          </div>
        }
      />

      {notice ? <Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert> : null}

      <div className="grid grid--4">
        <Card tone="navy" className="card--pad">
          <span className="mini-stat__label">صافي الرواتب</span>
          <div className="mini-stat__big">{money(runTotals.net)}</div>
          <span className="mini-stat__hint">جنيه مصري</span>
        </Card>

        <Card className="card--pad">
          <span className="mini-stat__label">الأساسي</span>
          <div className="mini-stat__big">{money(runTotals.base)}</div>
          <span className="mini-stat__hint">جنيه مصري</span>
        </Card>

        <Card className="card--pad">
          <span className="mini-stat__label">البدلات والحوافز</span>
          <div className="mini-stat__big text-green">+{money(runTotals.allowances)}</div>
          <span className="mini-stat__hint">مرتبطة بنتائج KPIs</span>
        </Card>

        <Card className="card--pad">
          <span className="mini-stat__label">الاستقطاعات</span>
          <div className="mini-stat__big text-red">−{money(runTotals.deductions)}</div>
          <span className="mini-stat__hint">تأمينات · ضرائب · تأخير</span>
        </Card>
      </div>

      <Card className="card--pad">
        <Table
          rows={runItems}
          getKey={(item) => item.id}
          columns={[
            {
              key: 'employee',
              label: 'الموظف',
              width: '2fr',
              render: (item) => (
                <div className="cell-person">
                  <strong>{item.employee?.name}</strong>
                  <span dir="ltr">{item.employee?.role}</span>
                </div>
              ),
            },
            {
              key: 'dept',
              label: 'القسم',
              width: '1.2fr',
              render: (item) => <span className="muted">{item.employee?.dept}</span>,
            },
            {
              key: 'base',
              label: 'الأساسي',
              width: '1fr',
              number: true,
              render: (item) => money(item.base),
            },
            {
              key: 'allowances',
              label: 'البدلات',
              width: '1fr',
              number: true,
              render: (item) => <span className="text-green">+{money(item.allowances)}</span>,
            },
            {
              key: 'deductions',
              label: 'الاستقطاعات',
              width: '1fr',
              number: true,
              render: (item) => <span className="text-red">−{money(item.deductions)}</span>,
            },
            {
              key: 'net',
              label: 'الصافي',
              width: '1.1fr',
              number: true,
              render: (item) => <strong>{money(item.net)}</strong>,
            },
            {
              key: 'status',
              label: 'الحالة',
              width: '1fr',
              render: (item) => (
                <Badge tone={payrollTone(item.status)}>
                  {item.statusLabel}
                </Badge>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
