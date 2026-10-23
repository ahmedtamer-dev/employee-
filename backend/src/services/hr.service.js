import { db } from '../lib/db.js';
import {
  addDays,
  clockToMinutes,
  formatArabicDate,
  formatShortDate,
  hoursBetween,
  monthName,
  startOfWeek,
  toISODate,
  todayISO,
} from '../utils/date.js';

export const STATUS_LABELS = {
  present: 'حاضر',
  remote: 'عن بُعد',
  late: 'متأخر',
  absent: 'غائب',
  leave: 'إجازة',
};

export const LEAVE_TYPE_LABELS = {
  annual: 'اعتيادية',
  casual: 'عارضة',
  sick: 'مرضية',
  unpaid: 'بدون أجر',
};

export const REQUEST_TYPE_LABELS = {
  leave: 'إجازة',
  advance: 'سلفة',
  certificate: 'شهادة راتب',
  overtime: 'عمل إضافي',
};

export const getEmployee = (id) => db.findOne('employees', (row) => row.id === id);

export const employeeSummary = (employee) =>
  employee
    ? {
        id: employee.id,
        code: employee.code,
        name: employee.name,
        role: employee.role,
        dept: employee.dept,
        email: employee.email,
        phone: employee.phone,
        hireDate: employee.hireDate,
        kpi: employee.kpi,
        goal: employee.goal,
        baseSalary: employee.baseSalary,
      }
    : null;

export const attendanceFor = (employeeId, date) =>
  db.findOne('attendance', (row) => row.employeeId === employeeId && row.date === date);

const weekDays = () => {
  const settings = db.data.settings;
  const start = startOfWeek();
  return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((label, index) => {
    const date = addDays(start, index);
    return {
      label,
      shortLabel: label.replace('الإثنين', 'إثن').replace('الثلاثاء', 'ثلا').replace('الأربعاء', 'أرب').replace('الخميس', 'خمي'),
      name: settings.weekDays?.[index]?.name || label,
      date: toISODate(date),
      day: date.getDate(),
    };
  });
};

export const employeeWeek = (employeeId) =>
  weekDays().map((day) => {
    const record = attendanceFor(employeeId, day.date);
    return {
      ...day,
      status: record?.status || null,
      statusLabel: record ? STATUS_LABELS[record.status] : null,
      hours: record?.hours ?? null,
      isToday: day.date === todayISO(),
    };
  });

export const attendanceSummary = (date = todayISO()) => {
  const records = db.find('attendance', (row) => row.date === date);
  const counts = { present: 0, remote: 0, late: 0, absent: 0, leave: 0 };

  records.forEach((record) => {
    if (counts[record.status] !== undefined) counts[record.status] += 1;
  });

  return {
    date,
    total: records.length,
    counts,
    present: counts.present,
    remote: counts.remote,
    late: counts.late,
    absent: counts.absent,
    leave: counts.leave,
  };
};

export const dailyAttendance = (date = todayISO()) => {
  const rows = db.data.employees.map((employee) => {
    const record = attendanceFor(employee.id, date) || null;
    const week = employeeWeek(employee.id).map((day) => day.status);
    return {
      employee: {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        dept: employee.dept,
        code: employee.code,
      },
      record: record
        ? {
            ...record,
            statusLabel: STATUS_LABELS[record.status],
          }
        : {
            status: 'absent',
            statusLabel: 'لم يُسجَّل',
            checkIn: null,
            checkOut: null,
            hours: null,
          },
      week,
    };
  });

  return {
    date,
    dateLabel: formatArabicDate(date),
    summary: attendanceSummary(date),
    rows,
    weekDays: weekDays(),
  };
};

export const leaveBalances = (employeeId) => {
  const types = db.data.settings.leaveTypes;
  const approved = db.find(
    'leaves',
    (row) => row.employeeId === employeeId && row.status === 'approved',
  );

  return types.map((type) => {
    const used = approved
      .filter((leave) => leave.type === type.key)
      .reduce((sum, leave) => sum + leave.days, 0);
    return {
      key: type.key,
      label: type.label,
      total: type.total,
      used,
      remaining: Math.max(0, type.total - used),
      percent: Math.min(100, Math.round((used / type.total) * 100)),
    };
  });
};

export const leaveBalancesAverage = () => {
  const employees = db.data.employees;
  if (!employees.length) return [];

  return db.data.settings.leaveTypes.map((type) => {
    const used = employees.reduce((sum, employee) => {
      const balance = leaveBalances(employee.id).find((row) => row.key === type.key);
      return sum + (balance?.used || 0);
    }, 0);
    const averageUsed = Math.round((used / employees.length) * 10) / 10;

    return {
      key: type.key,
      label: type.label,
      total: type.total,
      used: averageUsed,
      remaining: Math.max(0, Math.round((type.total - averageUsed) * 10) / 10),
      percent: Math.min(100, Math.round((averageUsed / type.total) * 100)),
    };
  });
};

export const serializeLeave = (leave) => {
  const employee = getEmployee(leave.employeeId);
  return {
    ...leave,
    typeLabel: LEAVE_TYPE_LABELS[leave.type] || leave.type,
    employeeName: employee?.name || leave.employeeName || '',
    employeeDept: employee?.dept || '',
    range: `${formatShortDate(leave.from)} – ${formatShortDate(leave.to)}`,
  };
};

export const serializeRequest = (request) => {
  const employee = getEmployee(request.employeeId);
  return {
    ...request,
    typeLabel: REQUEST_TYPE_LABELS[request.type] || request.type,
    employeeName: employee?.name || '',
    employeeDept: employee?.dept || '',
    range:
      request.from && request.to
        ? `${formatShortDate(request.from)} – ${formatShortDate(request.to)}`
        : formatShortDate(request.requestedAt || request.createdAt),
  };
};

const employeeKpis = (employee) => [
  { id: 'kpi-goal', name: employee.goal, progress: employee.kpi, value: `${employee.kpi}%` },
  { id: 'kpi-learning', name: 'رضا فريق المنتج', progress: 94, value: '4.7/5' },
  { id: 'kpi-training', name: 'حضور ورش التعلّم', progress: 80, value: '4/5' },
];

export const employeeDashboard = (employee) => {
  const today = todayISO();
  const record = attendanceFor(employee.id, today);
  const week = employeeWeek(employee.id);
  const hoursThisWeek = Math.round(
    week.reduce((sum, day) => sum + (day.hours || 0), 0) * 10,
  ) / 10;

  const now = new Date();
  let elapsedMinutes = 0;
  let running = false;

  if (record?.checkIn) {
    const start = clockToMinutes(new Date(`2000-01-01T${record.checkIn}:00`));
    const end = record.checkOut
      ? clockToMinutes(new Date(`2000-01-01T${record.checkOut}:00`))
      : clockToMinutes(now);
    elapsedMinutes = Math.max(0, end - start);
    running = !record.checkOut;
  }

  const run = db.data.payrollRuns[0];
  const payslipItem = run?.items.find((item) => item.employeeId === employee.id);
  const leaves = db.find(
    'leaves',
    (row) => row.employeeId === employee.id,
  );

  return {
    employee: employeeSummary(employee),
    today: {
      date: today,
      dateLabel: formatArabicDate(today),
      status: record?.status || null,
      statusLabel: record ? STATUS_LABELS[record.status] : 'لم يُسجَّل',
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      hours: record?.hours ?? null,
      elapsedMinutes,
      running,
    },
    week,
    hoursThisWeek,
    balances: leaveBalances(employee.id),
    kpis: employeeKpis(employee),
    announcements: db.data.announcements,
    payslip: {
      net: payslipItem?.net ?? null,
      label: run ? `${monthName(run.month)} ${run.year}` : '',
      payDate: run?.payDate || null,
    },
    pendingRequests: leaves.filter((leave) => leave.status === 'pending').length,
  };
};

export const hrDashboard = (user) => {
  const employees = db.data.employees;
  const today = todayISO();
  const summary = attendanceSummary(today);
  const exceptions = db
    .find('attendance', (row) => row.date === today && ['late', 'absent'].includes(row.status))
    .map((record) => {
      const employee = getEmployee(record.employeeId);
      return {
        id: record.id,
        name: employee?.name || '',
        dept: employee?.dept || '',
        in: record.checkIn || '—',
        status: record.status,
        statusLabel: STATUS_LABELS[record.status],
      };
    });

  const readiness = db.data.checklists.payrollReadiness;
  const pendingLeaves = db.find('leaves', (row) => row.status === 'pending');
  const pendingRequests = db.find('requests', (row) => row.status === 'pending');

  const stageLabels = ['متقدمون', 'فرز أولي', 'مقابلات', 'عرض وظيفي', 'تم التعيين'];
  const candidates = db.data.candidates;
  const funnel = [
    { key: 'all', label: 'متقدمون', value: candidates.length, tone: 'navy' },
    { key: 'screened', label: 'فرز أولي', value: candidates.filter((row) => row.stage >= 1).length, tone: 'navy2' },
    { key: 'interview', label: 'مقابلات', value: candidates.filter((row) => row.stage >= 2).length, tone: 'blue' },
    { key: 'offer', label: 'عروض', value: candidates.filter((row) => row.stage >= 3).length, tone: 'sky' },
    { key: 'hired', label: 'انضموا', value: candidates.filter((row) => row.stage >= 4).length, tone: 'pale' },
  ];
  const maxFunnel = Math.max(1, ...funnel.map((item) => item.value));

  return {
    greetingName: user?.name?.split(' ')[0] || db.data.users.find((row) => row.role === 'hr')?.name?.split(' ')[0] || 'منى',
    totalEmployees: employees.length,
    openPositions: db.data.settings.openPositions,
    turnover: db.data.settings.turnover,
    attentionCount: pendingLeaves.length + pendingRequests.length + readiness.filter((item) => !item.done).length,
    funnel: funnel.map((item) => ({
      ...item,
      percent: Math.max(12, Math.round((item.value / maxFunnel) * 100)),
    })),
    interviews: db.data.interviews,
    readiness,
    readinessDone: readiness.filter((item) => item.done).length,
    readinessTotal: readiness.length,
    closingDate: `25 ${monthName(new Date().getMonth() + 1)}`,
    exceptions,
    onboarding: db.data.onboarding,
    expiring: db.data.documents.map((document) => ({
      ...document,
      dueLabel: formatShortDate(document.dueDate),
    })),
    attendance: summary,
    pendingLeaves: pendingLeaves.length,
    pendingRequests: pendingRequests.length,
    stageLabels,
  };
};

export const managementDashboard = (user) => {
  const employees = db.data.employees;
  const today = todayISO();
  const summary = attendanceSummary(today);
  const total = Math.max(1, summary.total);
  const attendanceSplit = [
    { key: 'present', label: 'حاضرون', percent: Math.round((summary.present / total) * 100), tone: 'navy' },
    { key: 'remote', label: 'عن بُعد', percent: Math.round((summary.remote / total) * 100), tone: 'blue' },
    { key: 'leave', label: 'إجازة', percent: Math.round((summary.leave / total) * 100), tone: 'sky' },
    { key: 'late', label: 'متأخر', percent: Math.round(((summary.late + summary.absent) / total) * 100), tone: 'muted' },
  ];

  const week = weekDays();
  const dailyHours = week.map((day) => {
    const records = db.find('attendance', (row) => row.date === day.date);
    const hours = records.reduce((sum, row) => sum + (row.hours || 0), 0);
    const average = records.length ? Math.round((hours / records.length) * 10) / 10 : 0;
    return {
      ...day,
      hours: average,
      isToday: day.date === today,
      label: day.shortLabel,
    };
  });
  const activeDays = dailyHours.filter((day) => day.hours > 0);
  const hoursThisWeek = Math.round(
    activeDays.reduce((sum, day) => sum + day.hours, 0) * 10,
  ) / 10;

  const run = db.data.payrollRuns[0];
  const approvals = db.data.checklists.approvals;

  return {
    greetingName: user?.name?.split(' ')[0] || 'خالد',
    headcount: employees.length,
    newHires: db.data.onboarding.length,
    avgKpi: Math.round(employees.reduce((sum, row) => sum + row.kpi, 0) / Math.max(1, employees.length)),
    attendanceSplit,
    attendance: summary,
    week: dailyHours,
    hoursThisWeek,
    payroll: {
      label: run ? `${monthName(run.month)} ${run.year}` : '',
      monthLabel: run ? monthName(run.month) : '',
      progress: db.data.settings.payrollCycle.ready,
      statusLabel: run?.statusLabel || 'مسودة',
      runId: run?.id || null,
      cycle: db.data.settings.payrollCycle,
    },
    approvals,
    approvalsDone: approvals.filter((item) => item.done).length,
    approvalsTotal: approvals.length,
    accordion: [
      {
        id: 'acc-social',
        title: 'التأمينات الاجتماعية',
        rows: [
          { key: 'حصة الموظف', value: '11%' },
          { key: 'حصة الشركة', value: '18.75%' },
          { key: 'إجمالي الشهر', value: '412,300 ج.م' },
        ],
      },
      {
        id: 'acc-custody',
        title: 'العُهد والأجهزة',
        rows: [
          { key: 'MacBook Air M3', value: 'أحمد سمير' },
          { key: 'هاتف عمل', value: 'يوسف حسن' },
          { key: 'عُهد غير مستلمة', value: '4' },
        ],
      },
      {
        id: 'acc-comp',
        title: 'ملخص التعويضات',
        rows: [
          { key: 'متوسط الراتب', value: '17,900 ج.م' },
          { key: 'زيادات هذا العام', value: '8.5%' },
        ],
      },
      {
        id: 'acc-benefits',
        title: 'مزايا الموظفين',
        rows: [
          { key: 'تأمين طبي', value: '248 مشترك' },
          { key: 'اشتراك رياضي', value: '61 مشترك' },
        ],
      },
    ],
    calendar: {
      days: week.map((day) => ({
        name: day.label,
        day: day.day,
        isToday: day.date === today,
      })),
      events: db.data.events,
    },
  };
};

export const attendanceForEmployee = (employeeId, date = todayISO()) => attendanceFor(employeeId, date);

export const hoursOf = hoursBetween;
export const currentMonthLabel = () => `${monthName(new Date().getMonth() + 1)} ${new Date().getFullYear()}`;
