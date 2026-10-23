import { hashPassword } from '../lib/password.js';
import {
  addDays,
  hoursBetween,
  monthName,
  pad,
  startOfWeek,
  timeToMinutes,
  toISODate,
} from '../utils/date.js';

const DEMO_PASSWORD = '123456';

const STATUS_CODE = {
  حاضر: 'present',
  'عن بُعد': 'remote',
  متأخر: 'late',
  غائب: 'absent',
  إجازة: 'leave',
};

const WEEK_CODE_STATUS = {
  p: 'present',
  r: 'remote',
  l: 'late',
  a: 'absent',
  v: 'leave',
};

const EMPLOYEE_SEED = [
  {
    id: 'emp-001',
    code: 'NSQ-0142',
    name: 'أحمد سمير',
    role: 'مصمم واجهات',
    dept: 'التصميم',
    baseSalary: 18500,
    status: 'حاضر',
    checkIn: '08:52',
    kpi: 96,
    goal: 'تسليم شاشات المنتج في موعدها',
    email: 'ahmed@nasaq.co',
    phone: '0100 142 8890',
    hireDate: '2023-03-12',
    weekTemplate: ['p', 'p', 'r', 'p', 'p'],
  },
  {
    id: 'emp-002',
    code: 'NSQ-0101',
    name: 'منى عادل',
    role: 'مديرة موارد بشرية',
    dept: 'الموارد البشرية',
    baseSalary: 24000,
    status: 'حاضر',
    checkIn: '08:40',
    kpi: 91,
    goal: 'معدل الاحتفاظ بالموظفين',
    email: 'mona@nasaq.co',
    phone: '0100 101 4455',
    hireDate: '2020-01-05',
    weekTemplate: ['p', 'p', 'p', 'p', 'p'],
  },
  {
    id: 'emp-003',
    code: 'NSQ-0178',
    name: 'كريم فؤاد',
    role: 'مهندس برمجيات',
    dept: 'التطوير',
    baseSalary: 26000,
    status: 'عن بُعد',
    checkIn: '09:05',
    kpi: 89,
    goal: 'مهام السبرنت المنجزة',
    email: 'karim@nasaq.co',
    phone: '0100 178 3322',
    hireDate: '2022-08-21',
    weekTemplate: ['r', 'r', 'p', 'r', 'r'],
  },
  {
    id: 'emp-004',
    code: 'NSQ-0130',
    name: 'سارة نبيل',
    role: 'محاسبة',
    dept: 'المالية',
    baseSalary: 15500,
    status: 'متأخر',
    checkIn: '09:47',
    kpi: 78,
    goal: 'إغلاق الحسابات الشهرية',
    email: 'sara@nasaq.co',
    phone: '0100 130 7788',
    hireDate: '2021-11-02',
    weekTemplate: ['p', 'l', 'p', 'l', 'l'],
  },
  {
    id: 'emp-005',
    code: 'NSQ-0155',
    name: 'يوسف حسن',
    role: 'مسؤول مبيعات',
    dept: 'المبيعات',
    baseSalary: 13000,
    status: 'حاضر',
    checkIn: '08:58',
    kpi: 93,
    goal: 'تحقيق مستهدف المبيعات',
    email: 'youssef@nasaq.co',
    phone: '0100 155 2211',
    hireDate: '2023-06-18',
    weekTemplate: ['p', 'p', 'p', 'a', 'p'],
  },
  {
    id: 'emp-006',
    code: 'NSQ-0163',
    name: 'نور الهدى',
    role: 'دعم عملاء',
    dept: 'خدمة العملاء',
    baseSalary: 9500,
    status: 'إجازة',
    checkIn: null,
    kpi: 84,
    goal: 'رضا العملاء CSAT',
    email: 'nour@nasaq.co',
    phone: '0100 163 9090',
    hireDate: '2024-02-11',
    weekTemplate: ['p', 'p', 'v', 'v', 'v'],
  },
  {
    id: 'emp-007',
    code: 'NSQ-0092',
    name: 'عمر خالد',
    role: 'مدير منتج',
    dept: 'المنتج',
    baseSalary: 29000,
    status: 'غائب',
    checkIn: null,
    kpi: 72,
    goal: 'إطلاق المزايا على الخارطة',
    email: 'omar@nasaq.co',
    phone: '0100 092 5544',
    hireDate: '2019-09-01',
    weekTemplate: ['p', 'a', 'p', 'p', 'a'],
  },
  {
    id: 'emp-008',
    code: 'NSQ-0186',
    name: 'ليلى مصطفى',
    role: 'مسوّقة رقمية',
    dept: 'التسويق',
    baseSalary: 14000,
    status: 'حاضر',
    checkIn: '08:31',
    kpi: 88,
    goal: 'تكلفة اكتساب العميل',
    email: 'layla@nasaq.co',
    phone: '0100 186 6633',
    hireDate: '2024-05-19',
    weekTemplate: ['p', 'p', 'p', 'p', 'p'],
  },
];

const DEPARTMENTS = [
  { id: 'dept-design', name: 'التصميم', target: 85, metric: 'جودة التسليم في الموعد' },
  { id: 'dept-hr', name: 'الموارد البشرية', target: 85, metric: 'الاحتفاظ بالموظفين' },
  { id: 'dept-dev', name: 'التطوير', target: 85, metric: 'سرعة التسليم' },
  { id: 'dept-finance', name: 'المالية', target: 85, metric: 'دقة الإغلاق الشهري' },
  { id: 'dept-sales', name: 'المبيعات', target: 90, metric: 'تحقيق المستهدف' },
  { id: 'dept-support', name: 'خدمة العملاء', target: 88, metric: 'رضا العملاء' },
  { id: 'dept-product', name: 'المنتج', target: 85, metric: 'إنجاز خارطة الطريق' },
  { id: 'dept-marketing', name: 'التسويق', target: 85, metric: 'تكلفة اكتساب العميل' },
  { id: 'dept-ops', name: 'العمليات', target: 82, metric: 'كفاءة التشغيل' },
];

const PAYROLL_STATUS = ['approved', 'review', 'approved', 'review', 'approved', 'approved', 'hold', 'approved'];

const CANDIDATES = [
  { name: 'رنا إبراهيم', title: 'مصممة UX', stage: 2 },
  { name: 'حازم يحيى', title: 'مطوّر Backend', stage: 2 },
  { name: 'دينا سعيد', title: 'محاسب أول', stage: 1 },
  { name: 'مروان عاطف', title: 'مندوب مبيعات', stage: 0 },
  { name: 'شيماء ناصر', title: 'دعم عملاء', stage: 0 },
  { name: 'باسل منير', title: 'مطوّر Flutter', stage: 1 },
  { name: 'ياسمين فوزي', title: 'مسوّقة محتوى', stage: 3 },
  { name: 'مازن رأفت', title: 'مطوّر واجهات', stage: 4 },
];

const LEAVE_SEED = [
  { employeeId: 'emp-001', type: 'annual', days: 7, fromOffset: -62, note: 'إجازة صيفية', status: 'approved' },
  { employeeId: 'emp-001', type: 'casual', days: 2, fromOffset: -25, note: 'أمر عائلي', status: 'approved' },
  { employeeId: 'emp-006', type: 'annual', days: 3, fromOffset: 3, note: 'زيارة عائلية', status: 'pending' },
  { employeeId: 'emp-003', type: 'casual', days: 1, fromOffset: 7, note: 'أمر شخصي', status: 'pending' },
  { employeeId: 'emp-008', type: 'annual', days: 5, fromOffset: 11, note: 'إجازة قصيرة', status: 'pending' },
  { employeeId: 'emp-004', type: 'sick', days: 1, fromOffset: 1, note: 'إجازة مرضية', status: 'pending' },
  { employeeId: 'emp-005', type: 'unpaid', days: 2, fromOffset: 19, note: 'ظروف خاصة', status: 'pending' },
];

const buildUsers = (employees) => [
  {
    id: 'usr-emp',
    name: 'أحمد سمير',
    email: 'ahmed@nasaq.co',
    role: 'emp',
    employeeId: 'emp-001',
    passwordHash: hashPassword(DEMO_PASSWORD),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-hr',
    name: 'منى عادل',
    email: 'mona@nasaq.co',
    role: 'hr',
    employeeId: 'emp-002',
    passwordHash: hashPassword(DEMO_PASSWORD),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-mgmt',
    name: 'خالد منصور',
    email: 'khaled@nasaq.co',
    role: 'mgmt',
    employeeId: null,
    passwordHash: hashPassword(DEMO_PASSWORD),
    createdAt: new Date().toISOString(),
  },
  ...employees
    .filter((employee) => !['emp-001', 'emp-002'].includes(employee.id))
    .map((employee) => ({
      id: `usr-${employee.id}`,
      name: employee.name,
      email: employee.email,
      role: 'emp',
      employeeId: employee.id,
      passwordHash: hashPassword(DEMO_PASSWORD),
      createdAt: new Date().toISOString(),
    })),
];

const buildAttendance = (employees, today) => {
  const weekStart = startOfWeek(today);
  const todayDate = toISODate(today);
  const records = [];

  employees.forEach((employee) => {
    employee.weekTemplate.forEach((code, index) => {
      const date = addDays(weekStart, index);
      const dateISO = toISODate(date);

      if (dateISO > todayDate) return;

      const status = dateISO === todayDate ? STATUS_CODE[employee.status] : WEEK_CODE_STATUS[code];
      const checkIn = ['absent', 'leave'].includes(status) ? null : employee.checkIn;
      const checkOut =
        dateISO === todayDate || ['absent', 'leave'].includes(status)
          ? null
          : status === 'late'
            ? '17:10'
            : '17:00';

      records.push({
        id: `att-${employee.id}-${dateISO}`,
        employeeId: employee.id,
        date: dateISO,
        status,
        checkIn,
        checkOut,
        hours: checkIn && checkOut ? hoursBetween(checkIn, checkOut) : null,
        note: null,
        createdAt: new Date().toISOString(),
      });
    });
  });

  return records;
};

const buildPayrollRun = (employees, today) => {
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const items = employees.map((employee, index) => {
    const allowances = Math.round(employee.baseSalary * (employee.kpi >= 90 ? 0.2 : 0.12));
    const latePenalty = employee.status === 'متأخر' ? 250 : 0;
    const absencePenalty = employee.status === 'غائب' ? Math.round(employee.baseSalary / 30) : 0;
    const deductions =
      Math.round(employee.baseSalary * 0.11) +
      Math.round(employee.baseSalary * 0.06) +
      250 +
      latePenalty +
      absencePenalty;

    return {
      id: `pay-${employee.id}`,
      employeeId: employee.id,
      base: employee.baseSalary,
      allowances,
      deductions,
      net: employee.baseSalary + allowances - deductions,
      status: PAYROLL_STATUS[index] || 'review',
    };
  });

  return {
    id: `run-${year}-${pad(month)}`,
    month,
    year,
    label: `${monthName(month)} ${year}`,
    status: 'draft',
    payDate: toISODate(addDays(today, 6)),
    createdAt: new Date().toISOString(),
    approvedAt: null,
    items,
  };
};

const buildLeaves = (employees, today) =>
  LEAVE_SEED.map((leave, index) => {
    const employee = employees.find((row) => row.id === leave.employeeId);
    const from = addDays(today, leave.fromOffset);
    const to = addDays(from, leave.days - 1);

    return {
      id: `leave-${index + 1}`,
      employeeId: leave.employeeId,
      type: leave.type,
      from: toISODate(from),
      to: toISODate(to),
      days: leave.days,
      note: leave.note,
      status: leave.status || 'pending',
      requestedAt: new Date().toISOString(),
      decidedAt: leave.status === 'approved' ? new Date().toISOString() : null,
      decidedBy: leave.status === 'approved' ? 'usr-hr' : null,
      employeeName: employee?.name || '',
    };
  });

const buildRequests = (today) => {
  const rows = [
    { id: 'req-1', employeeId: 'emp-001', type: 'overtime', from: toISODate(addDays(today, -20)), to: toISODate(addDays(today, -20)), note: 'عمل إضافي 4 ساعات', status: 'pending' },
    { id: 'req-2', employeeId: 'emp-001', type: 'certificate', from: null, to: null, note: 'شهادة راتب موجهة للبنك', status: 'delivered' },
    { id: 'req-3', employeeId: 'emp-001', type: 'leave', from: toISODate(addDays(today, -47)), to: toISODate(addDays(today, -45)), note: 'إجازة اعتيادية', status: 'approved' },
    { id: 'req-4', employeeId: 'emp-005', type: 'advance', from: null, to: null, note: 'سلفة 5,000 ج.م', status: 'pending' },
    { id: 'req-5', employeeId: 'emp-003', type: 'overtime', from: toISODate(addDays(today, -2)), to: toISODate(addDays(today, -2)), note: 'عمل إضافي 6 ساعات', status: 'pending' },
    { id: 'req-6', employeeId: 'emp-004', type: 'certificate', from: null, to: null, note: 'شهادة خبرة', status: 'pending' },
  ];

  return rows.map((row) => ({ ...row, requestedAt: new Date().toISOString(), createdAt: new Date().toISOString() }));
};

/**
 * يبني نسخة بيانات أولية كاملة للمشروع.
 */
export function buildSeed() {
  const today = new Date();

  const employees = EMPLOYEE_SEED.map((employee) => ({
    ...employee,
    statusCode: STATUS_CODE[employee.status],
    createdAt: new Date().toISOString(),
  }));

  const attendance = buildAttendance(employees, today);
  const payrollRun = buildPayrollRun(employees, today);
  const leaves = buildLeaves(employees, today);
  const requests = buildRequests(today);
  const weekStart = startOfWeek(today);

  return {
    meta: {
      version: 1,
      seededAt: new Date().toISOString(),
      demoPassword: DEMO_PASSWORD,
    },
    users: buildUsers(employees),
    employees,
    departments: DEPARTMENTS,
    attendance,
    leaves,
    requests,
    payrollRuns: [payrollRun],
    candidates: CANDIDATES.map((candidate, index) => ({
      id: `cand-${index + 1}`,
      name: candidate.name,
      title: candidate.title,
      stage: candidate.stage,
      email: `candidate${index + 1}@mail.com`,
      phone: `011 0000 ${String(index + 1).padStart(2, '0')}00`,
      appliedAt: toISODate(addDays(today, -(index + 3))),
    })),
    interviews: [
      { id: 'int-1', time: '10:30', name: 'رنا إبراهيم', role: 'مصممة UX', date: toISODate(today) },
      { id: 'int-2', time: '12:00', name: 'حازم يحيى', role: 'مطوّر Backend', date: toISODate(today) },
      { id: 'int-3', time: '14:00', name: 'دينا سعيد', role: 'محاسب أول', date: toISODate(today) },
    ],
    onboarding: [
      { id: 'onb-1', name: 'مازن رأفت', role: 'مطوّر واجهات', progress: 40 },
      { id: 'onb-2', name: 'هبة شريف', role: 'محاسبة', progress: 75 },
      { id: 'onb-3', name: 'تامر علي', role: 'مبيعات', progress: 90 },
    ],
    documents: [
      { id: 'doc-1', kind: 'تجديد عقد', employeeName: 'سارة نبيل', dueDate: toISODate(addDays(today, 24)) },
      { id: 'doc-2', kind: 'بطاقة الرقم القومي', employeeName: 'يوسف حسن', dueDate: toISODate(addDays(today, 12)) },
      { id: 'doc-3', kind: 'فترة الاختبار', employeeName: 'هبة شريف', dueDate: toISODate(addDays(today, 29)) },
    ],
    announcements: [
      {
        id: 'ann-1',
        title: 'صرف رواتب الشهر يوم 28',
        body: 'يرجى مراجعة بيانات الحضور قبل الإقفال يوم 25.',
        pinned: true,
      },
      {
        id: 'ann-2',
        title: 'برنامج التأمين الطبي الجديد',
        body: 'تبدأ التغطية الجديدة من أول الشهر القادم لكل الموظفين.',
        pinned: false,
      },
    ],
    events: [
      {
        id: 'ev-1',
        title: 'اجتماع الفريق الأسبوعي',
        subtitle: 'مراجعة تقدم المشاريع',
        dayIndex: 4,
        start: 60,
        duration: 45,
        tone: 'light',
        attendees: 3,
      },
      {
        id: 'ev-2',
        title: 'تعريف الموظفين الجدد',
        subtitle: 'جولة على السياسات والأنظمة',
        dayIndex: 1,
        start: 100,
        duration: 60,
        tone: 'blue',
        attendees: 2,
      },
    ],
    checklists: {
      payrollReadiness: [
        { id: 'pr-1', title: 'إقفال الحضور والانصراف', sub: 'تم 21 من الشهر', done: true },
        { id: 'pr-2', title: 'احتساب العمل الإضافي', sub: '62 ساعة', done: true },
        { id: 'pr-3', title: 'ربط حوافز KPIs', sub: '14 موظف مستحق', done: false },
        { id: 'pr-4', title: 'تسوية السُلف', sub: '3 سُلف قائمة', done: false },
        { id: 'pr-5', title: 'مراجعة الاستقطاعات', sub: 'تأخير وغياب', done: false },
      ],
      approvals: [
        { id: 'ap-1', tag: 'إجازة', title: 'طلب إجازة اعتيادية', sub: 'نور الهدى · 3 أيام', done: true },
        { id: 'ap-2', tag: 'سلفة', title: 'طلب سلفة 5,000 ج.م', sub: 'يوسف حسن', done: true },
        { id: 'ap-3', tag: 'وقت', title: 'عمل إضافي 6 ساعات', sub: 'كريم فؤاد', done: false },
        { id: 'ap-4', tag: 'تعيين', title: 'عرض وظيفي - مطوّر', sub: 'إدارة التطوير', done: false },
        { id: 'ap-5', tag: 'عقد', title: 'تجديد عقد سنوي', sub: 'سارة نبيل', done: false },
        { id: 'ap-6', tag: 'تقييم', title: 'اعتماد تقييم الربع', sub: 'قسم المبيعات', done: false },
      ],
    },
    settings: {
      companyName: 'نسق',
      payDay: 28,
      workday: { start: '08:00', end: '17:00' },
      leaveTypes: [
        { key: 'annual', label: 'اعتيادية', total: 21 },
        { key: 'casual', label: 'عارضة', total: 7 },
        { key: 'sick', label: 'مرضية', total: 15 },
      ],
      weekDays: Array.from({ length: 5 }, (_, index) => {
        const date = addDays(weekStart, index);
        return {
          name: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'][index],
          date: toISODate(date),
          day: date.getDate(),
        };
      }),
      payrollCycle: { prepared: 40, review: 28, approval: 32, ready: 68 },
      turnover: 4.1,
      openPositions: 14,
      workStartMinutes: timeToMinutes('08:00'),
    },
  };
}
