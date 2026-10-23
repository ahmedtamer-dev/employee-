import { useState } from 'react';

import { api } from '../../api/index.js';
import { Alert, Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader, Progress, SectionTitle } from '../../components/ui.jsx';
import { useApi } from '../../hooks/useApi.js';
import { LEAVE_LABELS, REQUEST_LABELS } from '../../utils/format.js';

export default function Leaves() {
  const { data, loading, error, reload } = useApi(() =>
    Promise.all([api.leaves.list(), api.requests.list()]).then(([leaves, requests]) => ({
      leaves: leaves.leaves,
      balances: leaves.balances,
      pending: leaves.pending,
      requests: requests.requests,
    })),
  );

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const decide = async (leave, status) => {
    setBusyId(leave.id);
    setNotice(null);
    try {
      const result = await api.leaves.decide(leave.id, status);
      setNotice({ tone: 'success', text: result.message || 'تم حفظ القرار' });
      await reload();
    } catch (decisionError) {
      setNotice({ tone: 'error', text: decisionError.message });
    } finally {
      setBusyId(null);
    }
  };

  const leavesList = Array.isArray(data?.leaves) ? data.leaves : [];
  const balancesList = Array.isArray(data?.balances) ? data.balances : [];
  const requestsList = Array.isArray(data?.requests) ? data.requests : [];
  const pendingRequests = requestsList.filter((request) => request.status === 'pending');
  const pendingCount = data?.pending ?? leavesList.filter((l) => l.status === 'pending').length;
  const requestCounts = pendingRequests.reduce((accumulator, request) => {
    accumulator[request.type] = (accumulator[request.type] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <>
      <PageHeader
        title="الإجازات والطلبات"
        subtitle={`${pendingCount} طلبات إجازة بانتظار الرد · ${pendingRequests.length} طلبات أخرى معلّقة`}
      />

      {notice ? <Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert> : null}

      <div className="grid grid--3">
        <Card className="card--pad span-2">
          <SectionTitle hint={`${leavesList.length} طلب`}>
            طلبات الإجازة
          </SectionTitle>

          {leavesList.length === 0 ? (
            <EmptyState title="لا توجد طلبات إجازة" />
          ) : (
            <div className="request-list">
              {leavesList.map((leave) => (
                <div className="leave-row" key={leave.id}>
                  <div className="leave-row__days">{leave.days}</div>

                  <div className="leave-row__text">
                    <strong>
                      {leave.employeeName}
                      <span> · {LEAVE_LABELS[leave.type] || leave.typeLabel}</span>
                    </strong>
                    <span>
                      {leave.range} · {leave.employeeDept}
                    </span>
                    {leave.note ? <span className="muted">{leave.note}</span> : null}
                  </div>

                  {leave.status === 'pending' ? (
                    <div className="leave-row__actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => decide(leave, 'rejected')}
                        disabled={busyId === leave.id}
                      >
                        رفض
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => decide(leave, 'approved')}
                        disabled={busyId === leave.id}
                      >
                        موافقة
                      </button>
                    </div>
                  ) : (
                    <Badge tone={leave.status === 'approved' ? 'green' : 'red'}>
                      {leave.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="stack">
          <Card className="card--pad">
            <SectionTitle hint="متوسط الشركة">
              أرصدة الإجازات
            </SectionTitle>
            <div className="balance-list">
              {balancesList.map((balance) => (
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

          <Card tone="navy" className="card--pad">
            <SectionTitle>طلبات أخرى معلّقة</SectionTitle>
            <div className="simple-list">
              {['advance', 'certificate', 'overtime'].map((type) => (
                <div className="simple-row simple-row--spread" key={type}>
                  <span>{REQUEST_LABELS[type]}</span>
                  <strong>{requestCounts[type] || 0}</strong>
                </div>
              ))}
            </div>
            <p className="muted-on-navy">
              تظهر هذه الطلبات في سجل الطلبات وتُعتمد من مسؤول الموارد البشرية.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
