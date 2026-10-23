import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { api } from '../../api/index.js';
import { Alert, Avatar, Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui.jsx';
import Modal from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { STATUS_LABELS, STATUS_TONES, money } from '../../utils/format.js';
import { exportToCsv } from '../../utils/export.js';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY_FORM = {
  name: '',
  role: '',
  dept: '',
  baseSalary: '',
  email: '',
  phone: '',
};

export default function Employees() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [query, setQuery] = useState({ search: urlSearch, department: '' });

  // Sync state if URL changes (e.g. from Global Search navigation)
  useEffect(() => {
    const term = searchParams.get('search') || '';
    setSearchInput(term);
    setQuery((prev) => ({ ...prev, search: term }));
  }, [searchParams]);

  const { data, loading, error, reload } = useApi(
    () => api.employees.list(query),
    [query.search, query.department],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const canManage = user?.role === 'hr';

  const applySearch = (event) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setQuery((previous) => ({ ...previous, search: trimmed }));
    if (trimmed) {
      setSearchParams({ search: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const changeDepartment = (event) => {
    setQuery((previous) => ({ ...previous, department: event.target.value }));
  };

  const addEmployee = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const result = await api.employees.create({
        ...form,
        baseSalary: Number(form.baseSalary),
      });
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setNotice({ tone: 'success', text: `تمت إضافة ${result.employee.name} بنجاح` });
      await reload();
    } catch (saveError) {
      setNotice({ tone: 'error', text: saveError.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const handleExportCsv = () => {
    if (!data?.employees?.length) return;
    exportToCsv(
      `موظفي_نسق_${new Date().toISOString().slice(0, 10)}`,
      data.employees,
      [
        { key: 'code', label: 'كود الموظف' },
        { key: 'name', label: 'الاسم' },
        { key: 'role', label: 'المسمى الوظيفي' },
        { key: 'dept', label: 'القسم' },
        { key: 'baseSalary', label: 'الراتب الأساسي' },
        { key: 'kpi', label: 'مؤشر الأداء (%)' },
        { key: 'statusLabel', label: 'الحالة' },
        { key: 'email', label: 'البريد الإلكتروني' },
        { key: 'phone', label: 'الهاتف' },
      ],
    );
    showToast({
      title: 'تصدير البيانات',
      text: `تم تصدير ${data.employees.length} موظف إلى ملف Excel / CSV بنجاح`,
      tone: 'success',
    });
  };

  const employeesList = Array.isArray(data?.employees) ? data.employees : [];
  const departmentsList = Array.isArray(data?.departments) ? data.departments : [];
  const totalCount = data?.total ?? employeesList.length;

  return (
    <>
      <PageHeader
        title="الموظفين"
        subtitle={`${totalCount} موظف مطابق للفلاتر الحالية · ${departmentsList.length} أقسام`}
        actions={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--outline" onClick={handleExportCsv} title="تصدير كشف الموظفين كملف Excel">
              📥 تصدير Excel / CSV
            </button>
            {canManage ? (
              <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
                + إضافة موظف
              </button>
            ) : null}
          </div>
        }
      />

      {notice ? <Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert> : null}

      <Card className="card--pad filters">
        <form className="filters__search" onSubmit={applySearch}>
          <label className="field field--inline">
            <span className="sr-only">بحث</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="ابحث بالاسم أو القسم أو الكود…"
            />
          </label>
          <button type="submit" className="btn btn--outline">
            بحث
          </button>
        </form>

        <label className="field field--inline">
          <span>القسم</span>
          <select value={query.department} onChange={changeDepartment}>
            <option value="">كل الأقسام</option>
            {departmentsList.map((department) => (
              <option key={department.id || department.name} value={department.name}>
                {department.name} ({department.employees ?? ''})
              </option>
            ))}
          </select>
        </label>
      </Card>

      {employeesList.length === 0 ? (
        <Card className="card--pad">
          <EmptyState
            title="لا يوجد موظفون بهذه الفلاتر"
            description="جرّب تعديل البحث أو اختيار قسم آخر."
          />
        </Card>
      ) : (
        <div className="people-grid">
          {employeesList.map((employee) => (
            <Card className="person-card" key={employee.id}>
              <div className="person-card__top">
                <Avatar name={employee.name} size={58} square />
                <Badge tone={STATUS_TONES[employee.status] || 'gray'}>
                  {STATUS_LABELS[employee.status] || employee.statusLabel}
                </Badge>
              </div>

              <div className="person-card__body">
                <strong>{employee.name}</strong>
                <span>
                  {employee.role} · {employee.dept}
                </span>
                <span className="person-card__code" dir="ltr">
                  {employee.code}
                </span>
              </div>

              <div className="person-card__meta">
                <span>
                  الراتب الأساسي
                  <strong>{money(employee.baseSalary)}</strong>
                </span>
                <span>
                  مؤشر الأداء
                  <strong>{employee.kpi}%</strong>
                </span>
              </div>

              <div className="person-card__contact">
                <span dir="ltr">{employee.email || '—'}</span>
                <span dir="ltr">{employee.phone || '—'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="إضافة موظف"
        subtitle="سيتم إنشاء حساب دخول تلقائيًا بكلمة مرور 123456 عند إدخال البريد."
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <form className="form" onSubmit={addEmployee}>
          <div className="form__row">
            <label className="field">
              <span>الاسم الكامل</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>

            <label className="field">
              <span>المسمى الوظيفي</span>
              <input
                type="text"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                required
              />
            </label>
          </div>

          <div className="form__row">
            <label className="field">
              <span>القسم</span>
              <select
                value={form.dept}
                onChange={(event) => setForm({ ...form, dept: event.target.value })}
                required
              >
                <option value="">اختر القسم</option>
                {departmentsList.map((department) => (
                  <option key={department.id} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>الراتب الأساسي (ج.م)</span>
              <input
                type="number"
                min="1"
                value={form.baseSalary}
                onChange={(event) => setForm({ ...form, baseSalary: event.target.value })}
                required
              />
            </label>
          </div>

          <div className="form__row">
            <label className="field">
              <span>البريد الإلكتروني</span>
              <input
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="name@nasaq.co"
              />
            </label>

            <label className="field">
              <span>رقم الهاتف</span>
              <input
                type="tel"
                dir="ltr"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="0100 000 0000"
              />
            </label>
          </div>

          <div className="form__actions">
            <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'جارٍ الحفظ…' : 'إضافة الموظف'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
