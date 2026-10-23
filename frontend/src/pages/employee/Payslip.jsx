import { useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../../api/index.js';
import { Badge, Card, ErrorState, LoadingState, PageHeader, SectionTitle } from '../../components/ui.jsx';
import { useApi } from '../../hooks/useApi.js';
import { money, payrollTone } from '../../utils/format.js';

const fallbackPeriods = () => {
  const now = new Date();
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: date.toLocaleDateString('ar-EG', { month: 'long' }),
    };
  });
};

export default function Payslip() {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const { data, loading, error, reload } = useApi(
    () => api.payroll.payslip(period.month, period.year),
    [period.month, period.year],
  );

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data || !data.payslip) return null;

  const { payslip } = data;
  const periods = data.periods || fallbackPeriods();
  const empName = payslip.employee?.name || payslip.employeeName || 'الموظف';
  const empCode = payslip.employee?.code || 'NSQ-0142';
  const empRole = payslip.employee?.role || payslip.position || 'موظف';
  const earnings = Array.isArray(payslip.earnings) ? payslip.earnings : [];
  const deductions = Array.isArray(payslip.deductions) ? payslip.deductions : [];
  const totals = payslip.totals || {
    earnings: earnings.reduce((s, r) => s + (r.value || 0), 0),
    deductions: deductions.reduce((s, r) => s + (r.value || 0), 0),
    net: payslip.net || 0,
  };

  return (
    <>
      <PageHeader
        title="قسيمة الراتب"
        subtitle={`${empName} · كود الموظف ${empCode} · ${empRole}`}
        actions={
          <div className="chip-group" role="tablist" aria-label="اختيار الشهر">
            {periods.map((item) => {
              const active = item.month === period.month && item.year === period.year;
              return (
                <button
                  key={`${item.year}-${item.month}`}
                  type="button"
                  className={`chip ${active ? 'is-active' : ''}`}
                  onClick={() => setPeriod({ month: item.month, year: item.year })}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        }
      />

      <div className={`payslip-grid print-area ${loading ? 'is-loading' : ''}`}>
        <Card className="card--pad">
          <SectionTitle hint={<Badge tone={payrollTone(payslip.status)}>{payslip.statusLabel}</Badge>}>
            المستحقات
          </SectionTitle>

          <div className="money-list">
            {earnings.map((row) => (
              <div className="money-list__row" key={row.label}>
                <span>{row.label}</span>
                <strong>{money(row.value)}</strong>
              </div>
            ))}
          </div>

          <div className="money-list__total is-positive">
            <span>الإجمالي</span>
            <strong>{money(totals.earnings)}</strong>
          </div>
        </Card>

        <Card className="card--pad">
          <SectionTitle>الاستقطاعات</SectionTitle>

          <div className="money-list">
            {deductions.map((row) => (
              <div className="money-list__row" key={row.label}>
                <span>{row.label}</span>
                <strong>{money(row.value)}</strong>
              </div>
            ))}
          </div>

          <div className="money-list__total is-negative">
            <span>الإجمالي</span>
            <strong>{money(totals.deductions)}</strong>
          </div>
        </Card>

        <Card tone="navy" className="net-card">
          <div className="net-card__head">
            <SectionTitle>{`صافي ${payslip.label || 'الراتب'}`}</SectionTitle>
            <Badge tone="glass">{payslip.source === 'run' ? 'مسيّر معتمد' : 'احتساب تقديري'}</Badge>
          </div>

          <div className="net-card__amount">
            <strong>{money(totals.net)}</strong>
            <span>{`جنيه مصري · تحويل بنكي ${payslip.bank || 'CIB'}`}</span>
          </div>

          <div className="net-card__meta">
            <span>إجمالي المستحقات {money(totals.earnings)}</span>
            <span>إجمالي الاستقطاعات {money(totals.deductions)}</span>
          </div>

          <div className="net-card__actions">
            <button type="button" className="btn btn--light" onClick={() => window.print()}>
              تحميل PDF
            </button>
            <Link className="btn btn--outline-light" to="/requests">
              استفسار
            </Link>
          </div>
        </Card>
      </div>

      <Card className="card--pad payslip-note">
        <SectionTitle>ملاحظات</SectionTitle>
        <p>
          {payslip.source === 'run'
            ? 'هذه القسيمة صادرة من مسيّر الرواتب الرسمي للشهر المحدد، وتشمل البدلات المرتبطة بتقييم الأداء.'
            : 'لا يوجد مسيّر رواتب معتمد لهذا الشهر بعد، لذلك يتم عرض قيمة تقديرية محسوبة من الراتب الأساسي والبدلات.'}
        </p>
      </Card>
    </>
  );
}
