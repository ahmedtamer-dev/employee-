import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../api/index.js';
import { Avatar, Badge } from './ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LEAVE_LABELS,
  REQUEST_LABELS,
  REQUEST_TONES,
  STATUS_LABELS,
  STATUS_TONES,
  kpiTone,
  money,
  payrollTone,
  shortDate,
} from '../utils/format.js';

// SVG Icons tailored for different dashboard entities
const Icons = {
  search: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  ),
  close: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  page: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  ),
  action: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  employee: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  arrowLeft: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  arrowRight: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  mail: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  payslip: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="8" cy="15" r="1.5" />
      <line x1="14" y1="15" x2="18" y2="15" />
    </svg>
  ),
  leave: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  kpi: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  approval: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  hiring: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  clock: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const STAGE_LABELS = ['متقدمون', 'فرز أولي', 'مقابلات', 'عرض وظيفي', 'تم التعيين'];

export default function GlobalSearchModal({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'emp';
  const isHr = role === 'hr';
  const isMgmt = role === 'mgmt';
  const isEmp = role === 'emp';

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Role-specific loaded datasets
  const [empDashboard, setEmpDashboard] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);

  const [hrDashboard, setHrDashboard] = useState(null);
  const [allLeaves, setAllLeaves] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);

  const [mgmtDashboard, setMgmtDashboard] = useState(null);
  const [kpisOverview, setKpisOverview] = useState(null);

  const [employees, setEmployees] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Role metadata and customization
  const roleMeta = useMemo(() => {
    if (isEmp) {
      return {
        label: 'لوحة الموظف',
        title: 'البحث في بياناتي وإجراءاتي',
        placeholder: 'ابحث في طلباتك، قسائم الراتب، رصيد الإجازات، مهامك، أو زملائك…',
        tabs: [
          { key: 'all', label: 'الكل' },
          { key: 'requests', label: 'طلباتي' },
          { key: 'finance', label: 'الراتب والمالية' },
          { key: 'balance', label: 'الإجازات والحضور' },
          { key: 'actions', label: 'إجراءاتي' },
          { key: 'colleagues', label: 'دليل الزملاء' },
        ],
      };
    }
    if (isHr) {
      return {
        label: 'الموارد البشرية (HR)',
        title: 'البحث في عمليات الموارد البشرية',
        placeholder: 'ابحث في سجلات الموظفين، طلبات الإجازات، الحضور، مسيرات الرواتب، أو المرشحين…',
        tabs: [
          { key: 'all', label: 'الكل' },
          { key: 'employees', label: 'الموظفين' },
          { key: 'leaves', label: 'الإجازات والطلبات' },
          { key: 'attendance', label: 'الحضور والغياب' },
          { key: 'payroll', label: 'مسير الرواتب' },
          { key: 'hiring', label: 'التوظيف' },
          { key: 'actions', label: 'إجراءات HR' },
        ],
      };
    }
    // Management
    return {
      label: 'الإدارة التنفيذية',
      title: 'البحث في مؤشرات الأداء والقرارات',
      placeholder: 'ابحث في مؤشرات الأداء (KPIs)، الموافقات والاعتمادات، ميزانيات الرواتب، الموظفين…',
      tabs: [
        { key: 'all', label: 'الكل' },
        { key: 'kpis', label: 'مؤشرات الأداء' },
        { key: 'approvals', label: 'الاعتمادات والموافقات' },
        { key: 'payroll', label: 'الرواتب والميزانيات' },
        { key: 'employees', label: 'فريق العمل' },
        { key: 'actions', label: 'قرارات وإجراءات' },
      ],
    };
  }, [isEmp, isHr]);

  // Load datasets based on current role when modal is opened
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoading(true);

    const loadRoleData = async () => {
      try {
        if (isEmp) {
          const [dash, reqs, lvs, emps] = await Promise.all([
            api.dashboard.employee().catch(() => null),
            api.requests.mine().catch(() => ({ requests: [] })),
            api.leaves.mine().catch(() => ({ leaves: [] })),
            api.employees.list({ search: query.trim() }).catch(() => ({ employees: [] })),
          ]);
          if (isMounted) {
            setEmpDashboard(dash);
            setMyRequests(reqs?.requests || []);
            setMyLeaves(lvs?.leaves || []);
            setEmployees(emps?.employees || []);
          }
        } else if (isHr) {
          const [dash, lvs, reqs, cand, runs, emps] = await Promise.all([
            api.dashboard.hr().catch(() => null),
            api.leaves.list().catch(() => ({ leaves: [] })),
            api.requests.list().catch(() => ({ requests: [] })),
            api.recruitment.board().catch(() => ({ stages: [] })),
            api.payroll.runs().catch(() => ({ runs: [] })),
            api.employees.list({ search: query.trim() }).catch(() => ({ employees: [] })),
          ]);
          if (isMounted) {
            setHrDashboard(dash);
            setAllLeaves(lvs?.leaves || []);
            setAllRequests(reqs?.requests || []);
            const allCandidates = (cand?.stages || []).flatMap((stage) => stage.candidates || []);
            setCandidates(allCandidates);
            setPayrollRuns(runs?.runs || []);
            setEmployees(emps?.employees || []);
          }
        } else if (isMgmt) {
          const [dash, kpis, runs, emps] = await Promise.all([
            api.dashboard.management().catch(() => null),
            api.kpis.overview().catch(() => ({ top: [], departments: [] })),
            api.payroll.runs().catch(() => ({ runs: [] })),
            api.employees.list({ search: query.trim() }).catch(() => ({ employees: [] })),
          ]);
          if (isMounted) {
            setMgmtDashboard(dash);
            setKpisOverview(kpis);
            setPayrollRuns(runs?.runs || []);
            setEmployees(emps?.employees || []);
          }
        }
      } catch (err) {
        console.error('Error fetching search data for role', role, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRoleData();

    return () => {
      isMounted = false;
    };
  }, [open, role, isEmp, isHr, isMgmt, query]);

  // Handle focus, ESC key and modal scroll
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedItem(null);
      setSelectedIndex(0);
      setActiveTab('all');
      return;
    }

    document.body.classList.add('modal-open');
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      document.body.classList.remove('modal-open');
      clearTimeout(timer);
    };
  }, [open]);

  // -------------------------------------------------------------
  // BUILD ROLE-SPECIFIC SEARCHABLE COLLECTIONS
  // -------------------------------------------------------------

  const roleResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (text) => !q || (text && String(text).toLowerCase().includes(q));

    // =========================================================
    // 1. EMPLOYEE SEARCH RESULTS
    // =========================================================
    if (isEmp) {
      // My Requests
      const matchedRequests = myRequests
        .filter((r) => matches(r.type) || matches(REQUEST_LABELS[r.type]) || matches(r.note) || matches(r.range))
        .map((r) => ({
          id: `req-${r.id}`,
          category: 'requests',
          title: `طلب ${REQUEST_LABELS[r.type] || r.typeLabel || r.type}`,
          desc: `${r.range || shortDate(r.createdAt)}${r.note ? ` · ${r.note}` : ''}`,
          badge: STATUS_LABELS[r.status] || r.status,
          badgeTone: REQUEST_TONES[r.status] || 'amber',
          icon: 'leave',
          to: '/requests',
          data: r,
        }));

      // My Leaves
      const matchedLeaves = myLeaves
        .filter((l) => matches(l.type) || matches(l.typeLabel) || matches(l.reason) || matches(l.range))
        .map((l) => ({
          id: `leave-${l.id}`,
          category: 'requests',
          title: `إجازة ${l.typeLabel || l.type} (${l.days} أيام)`,
          desc: `${l.range}${l.reason ? ` · ${l.reason}` : ''}`,
          badge: STATUS_LABELS[l.status] || l.status,
          badgeTone: STATUS_TONES[l.status] || 'gray',
          icon: 'leave',
          to: '/requests',
          data: l,
        }));

      // My Payslip & Financials
      const payslipItems = [];
      if (empDashboard?.payslip?.net) {
        if (matches('راتب') || matches('قسيمة') || matches('صافي') || matches(empDashboard.payslip.label)) {
          payslipItems.push({
            id: 'my-payslip-net',
            category: 'finance',
            title: `صافي الراتب: ${money(empDashboard.payslip.net)} ج.م`,
            desc: `قسيمة شهر ${empDashboard.payslip.label} · تاريخ الإيداع: ${shortDate(empDashboard.payslip.payDate)}`,
            badge: 'متاح للتحميل',
            badgeTone: 'green',
            icon: 'payslip',
            to: '/payslip',
          });
        }
      }
      if (matches('قسيمة') || matches('بدلات') || matches('تأمينات') || matches('استقطاعات') || matches('راتب')) {
        payslipItems.push({
          id: 'my-payslip-page',
          category: 'finance',
          title: 'استعراض قسيمة الراتب الشهرية',
          desc: 'تفاصيل الراتب الأساسي، بدل السكن والانتقال، والاستقطاعات والضرائب',
          badge: 'مالياتي',
          badgeTone: 'blue',
          icon: 'payslip',
          to: '/payslip',
        });
      }

      // My Balances & Attendance
      const balanceItems = [];
      (empDashboard?.balances || []).forEach((b) => {
        if (matches(b.label) || matches('إجازة') || matches('رصيد') || matches(b.key)) {
          balanceItems.push({
            id: `bal-${b.key}`,
            category: 'balance',
            title: `رصيد ${b.label}`,
            desc: `المتبقي: ${b.remaining} يوم · المستهلك: ${b.used} يوم (من إجمالي ${b.total} يوم)`,
            badge: `${b.remaining} يوم متبقي`,
            badgeTone: b.remaining > 5 ? 'green' : 'amber',
            icon: 'leave',
            to: '/requests',
          });
        }
      });

      if (empDashboard?.today) {
        const today = empDashboard.today;
        if (matches('حضور') || matches('انصراف') || matches('ساعات') || matches('اليوم') || matches(today.statusLabel)) {
          balanceItems.push({
            id: 'my-attendance-today',
            category: 'balance',
            title: `سجل حضور اليوم (${today.dateLabel || 'اليوم'})`,
            desc: `الحالة: ${today.statusLabel} · الدخول: ${today.checkIn || 'لم يُسجل بعد'} · الساعات: ${today.hours || 0} س`,
            badge: today.statusLabel,
            badgeTone: STATUS_TONES[today.status] || 'gray',
            icon: 'clock',
            to: '/home',
          });
        }
      }

      (empDashboard?.kpis || []).forEach((k) => {
        if (matches(k.name) || matches('أداء') || matches('هدف') || matches('kpi')) {
          balanceItems.push({
            id: `my-kpi-${k.id}`,
            category: 'balance',
            title: `مؤشر الأداء: ${k.name}`,
            desc: `نسبة الإنجاز المحققة: ${k.value}`,
            badge: k.value,
            badgeTone: 'green',
            icon: 'kpi',
            to: '/home',
          });
        }
      });

      // My Quick Actions
      const actionItems = [
        {
          id: 'act-emp-checkin',
          category: 'actions',
          title: 'تسجيل الحضور / الانصراف',
          desc: 'تسجيل بصمة الدخول أو الخروج السريع لليوم',
          to: '/home',
          icon: 'clock',
          badge: 'فوري',
          badgeTone: 'blue',
        },
        {
          id: 'act-emp-leave',
          category: 'actions',
          title: 'تقديم طلب إجازة جديدة',
          desc: 'طلب إجازة اعتيادية أو عارضة أو مرضية بخصم من الرصيد',
          to: '/requests',
          icon: 'action',
          badge: 'طلب جديد',
          badgeTone: 'green',
        },
        {
          id: 'act-emp-advance',
          category: 'actions',
          title: 'طلب سلفة على الراتب',
          desc: 'إرسال طلب سلفة مالية يتم خصمها من الراتب القادم',
          to: '/requests',
          icon: 'action',
          badge: 'طلب مالي',
          badgeTone: 'amber',
        },
        {
          id: 'act-emp-cert',
          category: 'actions',
          title: 'طلب شهادة راتب / إثبات وظيفة',
          desc: 'إصدار شهادة راتب معتمدة من الموارد البشرية',
          to: '/requests',
          icon: 'action',
          badge: 'مستند',
          badgeTone: 'blue',
        },
        {
          id: 'act-emp-slip',
          category: 'actions',
          title: 'استعراض وتحميل قسيمة الراتب',
          desc: 'طباعة كشف الراتب للشهر الأخير بصيغة PDF',
          to: '/payslip',
          icon: 'payslip',
          badge: 'طباعة',
          badgeTone: 'green',
        },
      ].filter((a) => matches(a.title) || matches(a.desc));

      // Colleagues Directory (Excludes salary & sensitive HR fields for normal employees)
      const colleagueItems = employees
        .filter((emp) => matches(emp.name) || matches(emp.role) || matches(emp.dept) || matches(emp.code))
        .map((emp) => ({
          id: `colleague-${emp.id}`,
          category: 'colleagues',
          title: emp.name,
          desc: `${emp.role} · قسم ${emp.dept}`,
          badge: emp.code,
          badgeTone: 'gray',
          icon: 'employee',
          isColleague: true,
          data: emp,
        }));

      return {
        groups: [
          { key: 'requests', label: 'طلباتي ومستنداتي', items: [...matchedRequests, ...matchedLeaves] },
          { key: 'finance', label: 'الراتب والمالية', items: payslipItems },
          { key: 'balance', label: 'أرصدة الإجازات وساعات الحضور', items: balanceItems },
          { key: 'actions', label: 'إجراءاتي السريعة', items: actionItems },
          { key: 'colleagues', label: 'دليل الزملاء للاتصال', items: colleagueItems },
        ],
      };
    }

    // =========================================================
    // 2. HR OPERATIONS SEARCH RESULTS
    // =========================================================
    if (isHr) {
      // Employees Directory
      const employeeItems = employees
        .filter((emp) => matches(emp.name) || matches(emp.role) || matches(emp.dept) || matches(emp.code) || matches(emp.email))
        .map((emp) => ({
          id: `hr-emp-${emp.id}`,
          category: 'employees',
          title: emp.name,
          desc: `${emp.role} · ${emp.dept} · راتب: ${money(emp.baseSalary)} ج.م`,
          badge: emp.statusLabel || STATUS_LABELS[emp.status] || 'حاضر',
          badgeTone: STATUS_TONES[emp.status] || 'gray',
          icon: 'employee',
          isEmployee: true,
          data: emp,
        }));

      // Leaves & Requests
      const leaveItems = allLeaves
        .filter((l) => matches(l.employeeName) || matches(l.typeLabel) || matches(l.employeeDept) || matches(l.reason))
        .map((l) => ({
          id: `hr-leave-${l.id}`,
          category: 'leaves',
          title: `${l.employeeName} · إجازة ${l.typeLabel || l.type} (${l.days} أيام)`,
          desc: `${l.range} · قسم ${l.employeeDept || 'العام'}${l.reason ? ` · ${l.reason}` : ''}`,
          badge: STATUS_LABELS[l.status] || l.status,
          badgeTone: STATUS_TONES[l.status] || 'gray',
          icon: 'leave',
          to: '/leaves',
        }));

      const requestItems = allRequests
        .filter((r) => matches(r.employeeName) || matches(r.typeLabel) || matches(r.employeeDept) || matches(r.note))
        .map((r) => ({
          id: `hr-req-${r.id}`,
          category: 'leaves',
          title: `${r.employeeName} · طلب ${r.typeLabel || r.type}`,
          desc: `${r.range}${r.note ? ` · ${r.note}` : ''}`,
          badge: STATUS_LABELS[r.status] || r.status,
          badgeTone: REQUEST_TONES[r.status] || 'amber',
          icon: 'action',
          to: '/leaves',
        }));

      // Attendance & Exceptions
      const attendanceItems = [];
      (hrDashboard?.exceptions || []).forEach((ex) => {
        if (matches(ex.name) || matches(ex.dept) || matches(ex.statusLabel) || matches('تأخير') || matches('غياب')) {
          attendanceItems.push({
            id: `hr-ex-${ex.id}`,
            category: 'attendance',
            title: `${ex.name} · ${ex.statusLabel}`,
            desc: `قسم ${ex.dept} · وقت الدخول: ${ex.in || '—'}`,
            badge: ex.statusLabel,
            badgeTone: STATUS_TONES[ex.status] || 'red',
            icon: 'clock',
            to: '/attendance',
          });
        }
      });
      if (hrDashboard?.attendance && (matches('حضور') || matches('غياب') || matches('إحصائيات'))) {
        attendanceItems.push({
          id: 'hr-att-summary',
          category: 'attendance',
          title: 'ملخص حضور وانصراف اليوم',
          desc: `${hrDashboard.attendance.present} حاضر · ${hrDashboard.attendance.remote} عن بُعد · ${hrDashboard.attendance.late} متأخر · ${hrDashboard.attendance.absent} غائب`,
          badge: 'سجل اليوم',
          badgeTone: 'blue',
          icon: 'clock',
          to: '/attendance',
        });
      }

      // Payroll Runs
      const payrollItems = payrollRuns
        .filter((run) => matches(run.label) || matches(run.statusLabel) || matches('مسير') || matches('رواتب'))
        .map((run) => ({
          id: `hr-run-${run.id}`,
          category: 'payroll',
          title: `مسير رواتب ${run.label}`,
          desc: `إجمالي الصافي: ${money(run.totals?.net || run.totalNet)} ج.م · ${run.totals?.count || run.count} موظف · الصرف: ${shortDate(run.payDate)}`,
          badge: run.statusLabel,
          badgeTone: payrollTone(run.status),
          icon: 'payslip',
          to: '/payroll',
        }));

      // Candidates & Hiring
      const hiringItems = candidates
        .filter((c) => matches(c.name) || matches(c.title) || matches(STAGE_LABELS[c.stage]))
        .map((c) => ({
          id: `hr-cand-${c.id}`,
          category: 'hiring',
          title: `المرشح: ${c.name}`,
          desc: `المسمى: ${c.title} · المرحلة: ${STAGE_LABELS[c.stage] || 'متقدم'} · التقييم: ${c.rating}/5`,
          badge: STAGE_LABELS[c.stage] || 'متقدم',
          badgeTone: 'blue',
          icon: 'hiring',
          to: '/hiring',
        }));

      // HR Actions
      const hrActionItems = [
        {
          id: 'hr-act-add-emp',
          category: 'actions',
          title: 'إضافة موظف جديد',
          desc: 'فتح استمارة إضافة موظف جديد وتحديد بياناته الوظيفية',
          to: '/employees',
          icon: 'employee',
          badge: 'إجراء HR',
          badgeTone: 'green',
        },
        {
          id: 'hr-act-add-candidate',
          category: 'actions',
          title: 'إضافة مرشح توظيف جديد',
          desc: 'إدراج مرشح جديد في لوحة التوظيف ومتابعة المقابلات',
          to: '/hiring',
          icon: 'hiring',
          badge: 'توظيف',
          badgeTone: 'blue',
        },
        {
          id: 'hr-act-review-leaves',
          category: 'actions',
          title: 'مراجعة طلبات الإجازات المعلقة',
          desc: 'فحص وقبول أو رفض طلبات إجازات الموظفين',
          to: '/leaves',
          icon: 'leave',
          badge: 'موافقات',
          badgeTone: 'amber',
        },
        {
          id: 'hr-act-calc-payroll',
          category: 'actions',
          title: 'إعداد مسير رواتب جديد',
          desc: 'حساب مسير رواتب الشهر مع البدلات والخصميات',
          to: '/payroll',
          icon: 'payslip',
          badge: 'مالي',
          badgeTone: 'green',
        },
      ].filter((a) => matches(a.title) || matches(a.desc));

      return {
        groups: [
          { key: 'employees', label: 'دليل وسجلات الموظفين', items: employeeItems },
          { key: 'leaves', label: 'طلبات الإجازات والمعاملات', items: [...leaveItems, ...requestItems] },
          { key: 'attendance', label: 'سجل الحضور والاستثناءات', items: attendanceItems },
          { key: 'payroll', label: 'مسيرات الرواتب الشهرية', items: payrollItems },
          { key: 'hiring', label: 'لوحة التوظيف والمرشحين', items: hiringItems },
          { key: 'actions', label: 'إجراءات وعمليات الموارد البشرية', items: hrActionItems },
        ],
      };
    }

    // =========================================================
    // 3. MANAGEMENT SEARCH RESULTS
    // =========================================================
    if (isMgmt) {
      // KPIs & Department Performance
      const kpiItems = [];
      (kpisOverview?.departments || []).forEach((d) => {
        if (matches(d.name) || matches('مؤشر') || matches('قسم') || matches('أداء') || matches('kpi')) {
          kpiItems.push({
            id: `mgmt-dept-${d.id || d.name}`,
            category: 'kpis',
            title: `مؤشر أداء قسم ${d.name}`,
            desc: `متوسط الأداء: ${d.average}% · عدد الموظفين: ${d.count} موظف`,
            badge: `${d.average}%`,
            badgeTone: kpiTone(d.average),
            icon: 'kpi',
            to: '/kpis',
          });
        }
      });

      (kpisOverview?.top || []).forEach((top) => {
        if (matches(top.name) || matches(top.role) || matches(top.dept) || matches('أفضل') || matches('تميز')) {
          kpiItems.push({
            id: `mgmt-top-${top.id}`,
            category: 'kpis',
            title: `أعلى الموظفين أداءً: ${top.name}`,
            desc: `المؤشر: ${top.kpi}% · ${top.role} · قسم ${top.dept}`,
            badge: `${top.kpi}% إنجاز`,
            badgeTone: 'green',
            icon: 'kpi',
            to: '/kpis',
          });
        }
      });

      // Approvals & Decision Checklists
      const approvalItems = [];
      (mgmtDashboard?.approvals || []).forEach((app) => {
        if (matches(app.label) || matches('اعتماد') || matches('موافقة') || matches(app.desc)) {
          approvalItems.push({
            id: `mgmt-app-${app.id}`,
            category: 'approvals',
            title: `اعتماد: ${app.label || app.title}`,
            desc: `الحالة: ${app.done ? 'تم الاعتماد بنجاح ✓' : 'بانتظار موافقة الإدارة ⏳'}`,
            badge: app.done ? 'معتمد' : 'مطلوب اعتماده',
            badgeTone: app.done ? 'green' : 'amber',
            icon: 'approval',
            to: '/dashboard',
          });
        }
      });

      // Payroll & Financials
      const payrollItems = payrollRuns
        .filter((run) => matches(run.label) || matches('ميزانية') || matches('رواتب') || matches(run.statusLabel))
        .map((run) => ({
          id: `mgmt-run-${run.id}`,
          category: 'payroll',
          title: `مسير رواتب ${run.label}`,
          desc: `صافي التكلفة: ${money(run.totals?.net || run.totalNet)} ج.م · ${run.totals?.count || run.count} موظف`,
          badge: run.statusLabel,
          badgeTone: payrollTone(run.status),
          icon: 'payslip',
          to: '/payroll',
        }));

      // Employees Team Structure
      const employeeItems = employees
        .filter((emp) => matches(emp.name) || matches(emp.role) || matches(emp.dept) || matches(emp.code))
        .map((emp) => ({
          id: `mgmt-emp-${emp.id}`,
          category: 'employees',
          title: emp.name,
          desc: `${emp.role} · ${emp.dept} · تقييم: ${emp.kpi || 0}% · راتب: ${money(emp.baseSalary)} ج.م`,
          badge: `${emp.kpi || 0}% أداء`,
          badgeTone: kpiTone(emp.kpi || 0),
          icon: 'employee',
          isEmployee: true,
          data: emp,
        }));

      // Management Actions
      const mgmtActionItems = [
        {
          id: 'mgmt-act-payroll-app',
          category: 'actions',
          title: 'اعتماد مسير الرواتب الشهري',
          desc: 'المصادقة النهائية على مسير الرواتب وتحويل المستحقات',
          to: '/payroll',
          icon: 'approval',
          badge: 'اعتماد',
          badgeTone: 'green',
        },
        {
          id: 'mgmt-act-kpi-rep',
          category: 'actions',
          title: 'استعراض تقارير مؤشرات الأداء الشاملة',
          desc: 'مراجعة نسب إنجاز الأقسام والأهداف الاستراتيجية',
          to: '/kpis',
          icon: 'kpi',
          badge: 'تقارير',
          badgeTone: 'blue',
        },
        {
          id: 'mgmt-act-dash-overview',
          category: 'actions',
          title: 'نظرة شمولية على الحضور والكوادر',
          desc: 'مراجعة نسب الحضور والغياب وتوزيع ميزانية القوى العاملة',
          to: '/dashboard',
          icon: 'page',
          badge: 'لوحة القيادة',
          badgeTone: 'green',
        },
      ].filter((a) => matches(a.title) || matches(a.desc));

      return {
        groups: [
          { key: 'kpis', label: 'مؤشرات الأداء الاستراتيجية (KPIs)', items: kpiItems },
          { key: 'approvals', label: 'الاعتمادات والموافقات المطلوبة', items: approvalItems },
          { key: 'payroll', label: 'مسيرات الرواتب والميزانيات', items: payrollItems },
          { key: 'employees', label: 'فريق العمل وهيكل الشركة', items: employeeItems },
          { key: 'actions', label: 'قرارات وإجراءات الإدارة', items: mgmtActionItems },
        ],
      };
    }

    return { groups: [] };
  }, [
    isEmp,
    isHr,
    isMgmt,
    query,
    myRequests,
    myLeaves,
    empDashboard,
    employees,
    allLeaves,
    allRequests,
    hrDashboard,
    payrollRuns,
    candidates,
    kpisOverview,
    mgmtDashboard,
  ]);

  // Filter groups according to active tab
  const visibleGroups = useMemo(() => {
    if (activeTab === 'all') {
      return roleResults.groups.filter((g) => g.items.length > 0);
    }
    return roleResults.groups.filter((g) => g.key === activeTab && g.items.length > 0);
  }, [roleResults, activeTab]);

  // Flattened list for keyboard up/down navigation
  const flatItems = useMemo(() => {
    return visibleGroups.flatMap((g) => g.items);
  }, [visibleGroups]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeTab]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (selectedItem) {
        setSelectedItem(null);
      } else {
        onClose?.();
      }
      return;
    }

    if (selectedItem) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flatItems[selectedIndex];
      if (current) {
        handleActivateItem(current);
      }
    }
  };

  const handleActivateItem = (item) => {
    if (item.isEmployee || item.isColleague) {
      setSelectedItem(item);
    } else if (item.to) {
      navigate(item.to);
      onClose?.();
    }
  };

  const handleOpenEmployeeInPage = (emp) => {
    if (isHr || isMgmt) {
      navigate(`/employees?search=${encodeURIComponent(emp.code || emp.name)}`);
      onClose?.();
    }
  };

  // Helper to render entity icon
  const renderItemIcon = (iconType) => {
    const IconComp = Icons[iconType] || Icons.page;
    return (
      <div className={`search-item__icon search-item__icon--${iconType || 'page'}`}>
        <IconComp />
      </div>
    );
  };

  if (!open) return null;

  return (
    <div
      className="global-search-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
      onKeyDown={handleKeyDown}
    >
      <div className="global-search" role="dialog" aria-modal="true" aria-label="بحث الداشبورد">
        {/* Top Header with Role Indicator */}
        <div className="global-search__role-banner">
          <span className="global-search__role-badge">{roleMeta.label}</span>
          <span className="global-search__role-title">{roleMeta.title}</span>
        </div>

        {/* Search Input Bar */}
        <div className="global-search__input-wrapper">
          <span className="global-search__search-icon">
            <Icons.search />
          </span>
          <input
            ref={inputRef}
            type="search"
            className="global-search__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={roleMeta.placeholder}
            autoComplete="off"
            spellCheck="false"
          />
          {query ? (
            <button
              type="button"
              className="global-search__clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="مسح البحث"
            >
              <Icons.close />
            </button>
          ) : null}
          <button
            type="button"
            className="global-search__close-btn"
            onClick={onClose}
            title="إغلاق (Esc)"
            aria-label="إغلاق"
          >
            <kbd className="global-search__kbd">ESC</kbd>
          </button>
        </div>

        {/* Role-Specific Filter Pills */}
        <div className="global-search__tabs">
          {roleMeta.tabs.map((tab) => {
            const count =
              tab.key === 'all'
                ? roleResults.groups.reduce((sum, g) => sum + g.items.length, 0)
                : roleResults.groups.find((g) => g.key === tab.key)?.items.length || 0;

            return (
              <button
                key={tab.key}
                type="button"
                className={`global-search__tab ${activeTab === tab.key ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} <span className="tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="global-search__body" ref={listRef}>
          {selectedItem ? (
            /* Detailed Preview Inside Modal (Employee or Colleague) */
            <div className="global-search__preview">
              <div className="global-search__preview-header">
                <button
                  type="button"
                  className="global-search__back-btn"
                  onClick={() => setSelectedItem(null)}
                >
                  <Icons.arrowRight />
                  <span>العودة لنتائج البحث</span>
                </button>
                {selectedItem.data?.status ? (
                  <Badge tone={STATUS_TONES[selectedItem.data.status] || 'gray'}>
                    {selectedItem.data.statusLabel || STATUS_LABELS[selectedItem.data.status] || 'حاضر'}
                  </Badge>
                ) : null}
              </div>

              <div className="global-search__preview-card">
                <div className="preview-card__hero">
                  <Avatar name={selectedItem.data?.name} size={64} square />
                  <div className="preview-card__titles">
                    <h3>{selectedItem.data?.name}</h3>
                    <p className="preview-card__role">
                      {selectedItem.data?.role} · <strong>قسم {selectedItem.data?.dept}</strong>
                    </p>
                    <span className="preview-card__code" dir="ltr">
                      {selectedItem.data?.code}
                    </span>
                  </div>
                </div>

                <div className="preview-card__grid">
                  <div className="preview-card__info-box">
                    <span className="label">البريد الإلكتروني</span>
                    <a
                      href={selectedItem.data?.email ? `mailto:${selectedItem.data.email}` : undefined}
                      className="value value--link"
                      dir="ltr"
                    >
                      <Icons.mail />
                      {selectedItem.data?.email || 'غير مسجل'}
                    </a>
                  </div>

                  <div className="preview-card__info-box">
                    <span className="label">رقم الهاتف للتواصل</span>
                    <a
                      href={selectedItem.data?.phone ? `tel:${selectedItem.data.phone}` : undefined}
                      className="value value--link"
                      dir="ltr"
                    >
                      <Icons.phone />
                      {selectedItem.data?.phone || 'غير مسجل'}
                    </a>
                  </div>

                  {(isHr || isMgmt) && selectedItem.data?.baseSalary ? (
                    <div className="preview-card__info-box">
                      <span className="label">الراتب الأساسي</span>
                      <span className="value value--bold">
                        {money(selectedItem.data.baseSalary)} ج.م
                      </span>
                    </div>
                  ) : null}

                  {(isHr || isMgmt) && selectedItem.data?.kpi !== undefined ? (
                    <div className="preview-card__info-box">
                      <span className="label">مؤشر الأداء (KPI)</span>
                      <span className="value value--bold">{selectedItem.data.kpi}%</span>
                    </div>
                  ) : null}
                </div>

                {(isHr || isMgmt) ? (
                  <div className="preview-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary preview-card__btn"
                      onClick={() => handleOpenEmployeeInPage(selectedItem.data)}
                    >
                      <span>عرض في صفحة إدارة الموظفين</span>
                      <Icons.arrowLeft />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : flatItems.length === 0 && !loading ? (
            /* Empty State */
            <div className="global-search__empty">
              <div className="empty-icon">🔍</div>
              <h4>{`لا توجد نتائج مطابقة لـ «${query}»`}</h4>
              <p>
                {`جرّب البحث بكلمات أخرى تتعلق بـ ${roleMeta.label} أو تصفح التبويبات المتاحة بالأعلى.`}
              </p>
            </div>
          ) : (
            /* Grouped Role-Specific Results */
            <div className="global-search__sections">
              {visibleGroups.map((group) => (
                <div className="search-group" key={group.key}>
                  <div className="search-group__title">
                    <span>
                      {group.label} ({group.items.length})
                    </span>
                  </div>

                  <div className="search-group__list">
                    {group.items.map((item) => {
                      const itemIndex = flatItems.findIndex((fi) => fi.id === item.id);
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          className={`search-item search-item--custom ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleActivateItem(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                        >
                          {item.isEmployee || item.isColleague ? (
                            <Avatar name={item.data?.name} size={40} square />
                          ) : (
                            renderItemIcon(item.icon)
                          )}

                          <div className="search-item__content">
                            <div className="search-item__emp-top">
                              <strong>{item.title}</strong>
                            </div>
                            <p>{item.desc}</p>
                          </div>

                          <div className="search-item__emp-side">
                            {item.badge ? (
                              <Badge tone={item.badgeTone || 'gray'}>{item.badge}</Badge>
                            ) : null}
                            <span className="search-item__action-hint">انتقال ←</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Keyboard Shortcuts Guide */}
        <div className="global-search__footer">
          <div className="footer-keys">
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> للتنقل
            </span>
            <span>
              <kbd>↵</kbd> للاختيار
            </span>
            <span>
              <kbd>Esc</kbd> للإغلاق
            </span>
          </div>
          <div className="footer-tip">
            نظام <strong>نسق</strong> · مخصص لـ <strong>{roleMeta.label}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
