// ============================================================
//  نسق — Mock API  (matches exact backend schemas & UI shapes)
// ============================================================

const delay = (ms = 60) => new Promise((res) => setTimeout(res, ms + Math.random() * 40));

// ---------- helpers ----------
const todayDate = new Date().toISOString().split('T')[0];
const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const WEEK_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const WEEK_SHORT = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمس'];
const WEEK_EN    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildWeek() {
  const today = new Date();
  const dow   = today.getDay();   // 0=Sun
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    const isToday    = i === dow;
    const isPast     = i < dow;
    const isFuture   = i > dow;
    return {
      date:       d.toISOString().split('T')[0],
      shortLabel: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمس', 'جمع', 'سبت'][i],
      label:      ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][i],
      hours:      isFuture ? null : isPast ? (i === 5 || i === 6 ? 0 : 8 + (i % 2 === 0 ? 0.5 : -0.5)) : 7.5,
      isToday,
    };
  });
}

function buildCalendar() {
  const today = new Date();
  const dow   = today.getDay();
  const days  = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + 1 + i); // Mon–Fri
    return { day: d.getDate(), name: WEEK_EN[d.getDay()], isToday: d.toDateString() === today.toDateString() };
  });
  const events = [
    { id: 'ev1', dayIndex: 0, title: 'مراجعة الرواتب', subtitle: 'مع فريق المالية', start: 60,  duration: 60, tone: 'blue', attendees: 4 },
    { id: 'ev2', dayIndex: 1, title: 'مقابلة توظيف', subtitle: 'كريم عادل', start: 120, duration: 45, tone: 'light', attendees: 3 },
    { id: 'ev3', dayIndex: 2, title: 'اجتماع الأداء', subtitle: 'ربع سنوي', start: 0,   duration: 90, tone: 'blue', attendees: 8 },
    { id: 'ev4', dayIndex: 4, title: 'العرض الأسبوعي', subtitle: 'مع الإدارة', start: 60,  duration: 60, tone: 'light', attendees: 5 },
  ];
  return { days, events };
}

// ---------- users ----------
const USERS = [
  { id: 'usr-emp', name: 'أحمد سمير', email: 'ahmed@nasaq.co', password: '123456', role: 'emp', employeeId: 'emp-001', department: 'التصميم', position: 'مصمم واجهات', phone: '0100 142 8890' },
  { id: 'usr-hr',  name: 'منى عادل',   email: 'mona@nasaq.co',  password: '123456', role: 'hr',  employeeId: 'emp-002', department: 'الموارد البشرية', position: 'مديرة موارد بشرية', phone: '0100 101 4455' },
  { id: 'usr-mgmt', name: 'خالد منصور', email: 'khaled@nasaq.co', password: '123456', role: 'mgmt', employeeId: null, department: 'الإدارة التنفيذية', position: 'المدير التنفيذي', phone: '0100 345 6789' },
];

const makeToken = (id) => `mock-token-${id}-${Date.now()}`;
const sessions  = new Map();

function getUserFromToken(token) {
  if (!token) return null;
  if (sessions.has(token)) return sessions.get(token);
  const id = String(token).split('-')[2];
  return USERS.find((u) => u.id === id) || USERS[0];
}

// ---------- departments ----------
const DEPARTMENTS = [
  { id: 'dept-design', name: 'التصميم', employees: 1, target: 85, metric: 'جودة التسليم في الموعد' },
  { id: 'dept-hr', name: 'الموارد البشرية', employees: 1, target: 85, metric: 'الاحتفاظ بالموظفين' },
  { id: 'dept-dev', name: 'التطوير', employees: 2, target: 85, metric: 'سرعة التسليم' },
  { id: 'dept-finance', name: 'المالية', employees: 1, target: 85, metric: 'دقة الإغلاق الشهري' },
  { id: 'dept-sales', name: 'المبيعات', employees: 1, target: 90, metric: 'تحقيق المستهدف' },
  { id: 'dept-support', name: 'خدمة العملاء', employees: 1, target: 88, metric: 'رضا العملاء' },
  { id: 'dept-product', name: 'المنتج', employees: 1, target: 85, metric: 'إنجاز خارطة الطريق' },
  { id: 'dept-marketing', name: 'التسويق', employees: 1, target: 85, metric: 'تكلفة اكتساب العميل' },
];

// ---------- employees ----------
let EMPLOYEES = [
  { id: 'emp-001', code: 'NSQ-0142', name: 'أحمد سمير',  role: 'مصمم واجهات',     dept: 'التصميم',       baseSalary: 18500, kpi: 96, email: 'ahmed@nasaq.co',   phone: '0100 142 8890', status: 'present', statusLabel: 'حاضر',   checkIn: '08:52', checkOut: null,    hours: 7.5 },
  { id: 'emp-002', code: 'NSQ-0101', name: 'منى عادل',    role: 'مديرة موارد بشرية', dept: 'الموارد البشرية', baseSalary: 24000, kpi: 91, email: 'mona@nasaq.co',    phone: '0100 101 4455', status: 'present', statusLabel: 'حاضر',   checkIn: '08:40', checkOut: null,    hours: 8   },
  { id: 'emp-003', code: 'NSQ-0178', name: 'كريم فؤاد',   role: 'مهندس برمجيات',   dept: 'التطوير',       baseSalary: 26000, kpi: 89, email: 'karim@nasaq.co',   phone: '0100 178 3322', status: 'remote',  statusLabel: 'عن بُعد', checkIn: '09:05', checkOut: null,    hours: 8   },
  { id: 'emp-004', code: 'NSQ-0130', name: 'سارة نبيل',   role: 'محاسبة',          dept: 'المالية',       baseSalary: 15500, kpi: 78, email: 'sara@nasaq.co',    phone: '0100 130 7788', status: 'late',    statusLabel: 'متأخر',   checkIn: '09:47', checkOut: null,    hours: 5.5 },
  { id: 'emp-005', code: 'NSQ-0155', name: 'يوسف حسن',    role: 'مسؤول مبيعات',    dept: 'المبيعات',      baseSalary: 13000, kpi: 93, email: 'youssef@nasaq.co', phone: '0100 155 2211', status: 'present', statusLabel: 'حاضر',   checkIn: '08:58', checkOut: '17:00', hours: 9   },
  { id: 'emp-006', code: 'NSQ-0163', name: 'نور الهدى',   role: 'دعم عملاء',       dept: 'خدمة العملاء',  baseSalary: 9500,  kpi: 84, email: 'nour@nasaq.co',    phone: '0100 163 9090', status: 'leave',   statusLabel: 'إجازة',   checkIn: null,    checkOut: null,    hours: 0   },
  { id: 'emp-007', code: 'NSQ-0092', name: 'عمر خالد',    role: 'مدير منتج',       dept: 'المنتج',        baseSalary: 29000, kpi: 72, email: 'omar@nasaq.co',    phone: '0100 092 5544', status: 'absent',  statusLabel: 'غائب',    checkIn: null,    checkOut: null,    hours: 0   },
  { id: 'emp-008', code: 'NSQ-0186', name: 'ليلى مصطفى',  role: 'مسوّقة رقمية',    dept: 'التسويق',       baseSalary: 14000, kpi: 88, email: 'layla@nasaq.co',   phone: '0100 186 6633', status: 'present', statusLabel: 'حاضر',   checkIn: '08:31', checkOut: null,    hours: 7   },
];

// Compatibility getters for employee
const mapEmployee = (e) => ({
  ...e,
  department: e.dept,
  position: e.role,
  salary: e.baseSalary,
});

// ---------- recruitment candidates ----------
const RECRUITMENT_STAGES = ['متقدمون', 'فرز أولي', 'مقابلات', 'عرض وظيفي', 'تم التعيين'];

let CANDIDATES = [
  { id: 'cand_1', name: 'رنا إبراهيم', title: 'مصممة UX', stage: 2, appliedAt: '2026-10-10' },
  { id: 'cand_2', name: 'حازم يحيى',  title: 'مطوّر Backend', stage: 2, appliedAt: '2026-10-12' },
  { id: 'cand_3', name: 'دينا سعيد',   title: 'محاسب أول', stage: 1, appliedAt: '2026-10-15' },
  { id: 'cand_4', name: 'مروان عاطف',  title: 'مندوب مبيعات', stage: 0, appliedAt: '2026-10-18' },
  { id: 'cand_5', name: 'شيماء ناصر',  title: 'دعم عملاء', stage: 0, appliedAt: '2026-10-20' },
  { id: 'cand_6', name: 'باسل منير',   title: 'مطوّر Flutter', stage: 1, appliedAt: '2026-10-14' },
  { id: 'cand_7', name: 'ياسمين فوزي', title: 'مسوّقة محتوى', stage: 3, appliedAt: '2026-10-05' },
  { id: 'cand_8', name: 'مازن رأفت',   title: 'مطوّر واجهات', stage: 4, appliedAt: '2026-09-28' },
];

function buildRecruitmentBoard() {
  return {
    stages: RECRUITMENT_STAGES,
    columns: RECRUITMENT_STAGES.map((title, stage) => {
      const items = CANDIDATES
        .filter((c) => c.stage === stage)
        .map((c) => ({
          id: c.id,
          name: c.name,
          title: c.title,
          initials: c.name.charAt(0),
          stage: c.stage,
          canMove: stage < RECRUITMENT_STAGES.length - 1,
        }));
      return { stage, title, count: items.length, items };
    }),
    total: CANDIDATES.length,
  };
}

// ---------- leaves ----------
let LEAVES = [
  { id: 'l1', employeeId: 'emp-001', employeeName: 'أحمد سمير',  employeeDept: 'التصميم',       type: 'annual', typeLabel: 'اعتيادية', days: 4, range: '25 أكتوبر ← 28 أكتوبر', from: '2026-10-25', to: '2026-10-28', note: 'إجازة سنوية عائلية', status: 'approved', createdAt: '2026-10-15' },
  { id: 'l2', employeeId: 'emp-004', employeeName: 'سارة نبيل',  employeeDept: 'المالية',       type: 'sick',   typeLabel: 'مرضية',   days: 2, range: '14 أكتوبر ← 15 أكتوبر', from: '2026-10-14', to: '2026-10-15', note: 'نزلة معوية', status: 'approved', createdAt: '2026-10-14' },
  { id: 'l3', employeeId: 'emp-006', employeeName: 'نور الهدى',  employeeDept: 'خدمة العملاء',  type: 'annual', typeLabel: 'اعتيادية', days: 3, range: '22 أكتوبر ← 24 أكتوبر', from: '2026-10-22', to: '2026-10-24', note: 'ظروف شخصية', status: 'pending',  createdAt: '2026-10-20' },
  { id: 'l4', employeeId: 'emp-003', employeeName: 'كريم فؤاد',  employeeDept: 'التطوير',       type: 'casual', typeLabel: 'عارضة',   days: 1, range: '28 أكتوبر',            from: '2026-10-28', to: '2026-10-28', note: 'تجديد أوراق رسمية', status: 'pending', createdAt: '2026-10-21' },
];

// ---------- requests ----------
let REQUESTS = [
  { id: 'r1', employeeId: 'emp-001', employeeName: 'أحمد سمير', type: 'certificate', typeLabel: 'شهادة راتب', note: 'موجهة إلى بنك CIB', status: 'pending',  createdAt: '2026-10-18', range: '18 أكتوبر' },
  { id: 'r2', employeeId: 'emp-001', employeeName: 'أحمد سمير', type: 'advance',     typeLabel: 'سلفة',       note: 'سلفة شهر أكتوبر 5000 ج.م', status: 'approved', createdAt: '2026-10-05', range: '05 أكتوبر' },
  { id: 'r3', employeeId: 'emp-003', employeeName: 'كريم فؤاد', type: 'overtime',    typeLabel: 'عمل إضافي',   note: 'تسليم إصدار عاجل يوم الجمعة', status: 'approved', createdAt: '2026-10-12', range: '12 أكتوبر' },
];

// ---------- payroll runs & items ----------
function buildRunItems() {
  return EMPLOYEES.map((emp) => {
    const base = emp.baseSalary;
    const allowances = Math.round(base * (emp.kpi >= 90 ? 0.2 : 0.12));
    const deductions = Math.round(base * 0.11) + Math.round(base * 0.06) + 250;
    const net = base + allowances - deductions;
    return {
      id: `pay_${emp.id}`,
      employeeId: emp.id,
      base,
      allowances,
      deductions,
      net,
      status: 'approved',
      statusLabel: 'معتمد',
      bank: 'CIB ****4821',
      employee: {
        id: emp.id,
        code: emp.code,
        name: emp.name,
        role: emp.role,
        dept: emp.dept,
      },
    };
  });
}

const runItemsOct = buildRunItems();
const totalsOct = {
  count: runItemsOct.length,
  base: runItemsOct.reduce((s, i) => s + i.base, 0),
  allowances: runItemsOct.reduce((s, i) => s + i.allowances, 0),
  deductions: runItemsOct.reduce((s, i) => s + i.deductions, 0),
  net: runItemsOct.reduce((s, i) => s + i.net, 0),
};

let PAYROLL_RUNS = [
  {
    id: 'run-2026-10',
    month: 10,
    year: 2026,
    label: 'أكتوبر 2026',
    status: 'approved',
    statusLabel: 'معتمد',
    payDate: '2026-10-27',
    approvedAt: '2026-10-26T14:00:00Z',
    totals: totalsOct,
    items: runItemsOct,
  },
  {
    id: 'run-2026-09',
    month: 9,
    year: 2026,
    label: 'سبتمبر 2026',
    status: 'approved',
    statusLabel: 'معتمد',
    payDate: '2026-09-27',
    approvedAt: '2026-09-26T14:00:00Z',
    totals: totalsOct,
    items: runItemsOct,
  },
  {
    id: 'run-2026-08',
    month: 8,
    year: 2026,
    label: 'أغسطس 2026',
    status: 'approved',
    statusLabel: 'معتمد',
    payDate: '2026-08-27',
    approvedAt: '2026-08-26T14:00:00Z',
    totals: totalsOct,
    items: runItemsOct,
  },
];

// ============================================================
//  Mock Request Router
// ============================================================
export async function mockRequest(path, { method = 'GET', body, query = {} } = {}, token) {
  await delay();
  const user = getUserFromToken(token);

  // Normalize path without query string
  const cleanPath = path.split('?')[0];

  // ===== AUTH =====
  if (cleanPath === '/auth/login' && method === 'POST') {
    const emailInput = String(body?.email || '').trim().toLowerCase();
    const found = USERS.find(
      (u) => u.email.toLowerCase() === emailInput && u.password === body?.password,
    );
    if (!found) throw { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    const tk = makeToken(found.id);
    sessions.set(tk, found);
    const { password: _p, ...safe } = found;
    return { token: tk, user: safe };
  }

  if (cleanPath === '/auth/me') {
    if (!user) throw { message: 'غير مصرح' };
    const { password: _p, ...safe } = user;
    return { user: safe };
  }

  if (cleanPath === '/auth/demo-accounts') {
    return {
      password: '123456',
      accounts: USERS.map(({ id: _, password: _p, ...u }) => ({
        role: u.role,
        label: u.department,
        email: u.email,
      })),
    };
  }

  // ===== DASHBOARD — EMPLOYEE =====
  if (cleanPath === '/dashboard/employee') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    const myLeaves = LEAVES.filter((l) => l.employeeId === emp.id);
    const annualUsed = myLeaves.filter((l) => l.status === 'approved' && l.type === 'annual').reduce((s, l) => s + l.days, 0);
    const sickUsed   = myLeaves.filter((l) => l.status === 'approved' && l.type === 'sick').reduce((s, l) => s + l.days, 0);
    const pending    = REQUESTS.filter((r) => r.employeeId === emp.id && r.status === 'pending').length;
    const week       = buildWeek();
    const todayHours = week.find((d) => d.isToday)?.hours || 7.5;
    const elapsedMin = Math.round(todayHours * 60);

    return {
      employee: emp,
      hoursThisWeek: week.filter((d) => d.hours).reduce((s, d) => s + (d.hours || 0), 0).toFixed(1),
      pendingRequests: pending,
      week,
      today: {
        date:           todayDate,
        checkIn:        emp.checkIn  ? `${emp.checkIn} ص`  : null,
        checkOut:       emp.checkOut ? `${emp.checkOut} م` : null,
        status:         emp.status || 'present',
        statusLabel:    emp.statusLabel || 'حاضر',
        elapsedMinutes: elapsedMin,
      },
      balances: [
        { key: 'annual', label: 'إجازة سنوية', total: 21, used: annualUsed, remaining: 21 - annualUsed, percent: Math.round((annualUsed / 21) * 100) },
        { key: 'sick',   label: 'إجازة مرضية', total: 14, used: sickUsed,   remaining: 14 - sickUsed,   percent: Math.round((sickUsed / 14) * 100) },
        { key: 'casual', label: 'إجازة عارضة', total: 7,  used: 1,          remaining: 6,               percent: 14 },
      ],
      payslip: {
        net:     Math.round(emp.baseSalary * 0.85) + 1600,
        label:   'أكتوبر 2026',
        payDate: '2026-10-27',
      },
      kpis: [
        { id: 'k1', name: 'جودة التسليم',       progress: emp.kpi, value: `${emp.kpi}%` },
        { id: 'k2', name: 'الالتزام بالمواعيد', progress: 95,      value: '95%' },
        { id: 'k3', name: 'التعاون مع الفريق',  progress: 88,      value: '88%' },
      ],
      announcements: [
        { id: 'a1', title: 'تحديث سياسة العمل عن بُعد', body: 'يُسمح بالعمل عن بُعد يومين أسبوعياً اعتباراً من أول الشهر.', pinned: true },
        { id: 'a2', title: 'وثيقة التأمين الطبي', body: 'تبدأ التغطية الصحية الجديدة لكافة الموظفين من أول الشهر القادم.', pinned: false },
      ],
    };
  }

  // ===== DASHBOARD — HR =====
  if (cleanPath === '/dashboard/hr') {
    const pending = LEAVES.filter((l) => l.status === 'pending').length;
    const absent  = EMPLOYEES.filter((a) => a.status === 'absent').length;
    const late    = EMPLOYEES.filter((a) => a.status === 'late').length;

    return {
      greetingName: user?.name?.split(' ')[0] || 'منى',
      attentionCount: pending + absent + late,
      totalEmployees: EMPLOYEES.length,
      openPositions:  CANDIDATES.filter((c) => c.stage < 4).length,
      turnover:       3.8,

      funnel: [
        { key: 'applied',   label: 'طلبات',   value: CANDIDATES.length + 10, percent: 100, tone: 'blue' },
        { key: 'screening', label: 'فرز',     value: 8,                      percent: 60,  tone: 'sky'  },
        { key: 'interview', label: 'مقابلات', value: 4,                      percent: 30,  tone: 'navy' },
        { key: 'offer',     label: 'عروض',    value: 2,                      percent: 15,  tone: 'green' },
      ],

      interviews: [
        { id: 'i1', time: '11:00', name: 'رنا إبراهيم', role: 'مصممة UX' },
        { id: 'i2', time: '14:30', name: 'حازم يحيى',  role: 'مطوّر Backend' },
      ],

      readiness: [
        { id: 'pr1', title: 'مراجعة بيانات الحضور',      sub: 'آخر تحديث منذ ساعة', done: true  },
        { id: 'pr2', title: 'إدخال البدلات والاستقطاعات', sub: '8 موظفين',          done: true  },
        { id: 'pr3', title: 'مراجعة الإجازات المعلقة',    sub: '2 طلبات',            done: true  },
        { id: 'pr4', title: 'اعتماد المدير المالي',       sub: 'تمت الموافقة',       done: true  },
        { id: 'pr5', title: 'تحويل الرواتب للبنك',        sub: 'موعد: 27 أكتوبر',    done: false },
      ],
      readinessDone:  4,
      readinessTotal: 5,
      closingDate:    '27 أكتوبر',

      exceptions: EMPLOYEES.filter((e) => ['late', 'absent'].includes(e.status)).map((e) => ({
        id: `ex_${e.id}`,
        name: e.name,
        dept: e.dept,
        in: e.checkIn || '—',
        status: e.status,
        statusLabel: e.statusLabel,
      })),

      onboarding: [
        { id: 'ob1', name: 'يوسف حسن',   role: 'مسؤول مبيعات', progress: 85 },
        { id: 'ob2', name: 'ليلى مصطفى', role: 'مسوّقة رقمية', progress: 50 },
      ],

      expiring: [
        { id: 'ex3', kind: 'عقد عمل',    employeeName: 'كريم فؤاد', dueLabel: 'خلال 15 يومًا' },
        { id: 'ex4', kind: 'تأمين طبي',  employeeName: 'سارة نبيل', dueLabel: 'خلال 22 يومًا' },
        { id: 'ex5', kind: 'شهادة خبرة', employeeName: 'يوسف حسن',  dueLabel: 'خلال 30 يومًا' },
      ],
    };
  }

  // ===== DASHBOARD — MANAGEMENT =====
  if (cleanPath === '/dashboard/management') {
    const greetingName = user?.name?.split(' ')[0] || 'خالد';
    const avgKpi       = Math.round(EMPLOYEES.reduce((s, k) => s + k.kpi, 0) / EMPLOYEES.length);
    const week         = buildWeek();

    return {
      greetingName,
      headcount:      EMPLOYEES.length,
      newHires:       2,
      avgKpi,
      hoursThisWeek: '39.2',
      week,

      attendanceSplit: [
        { key: 'present', label: 'حاضر',   percent: 75, value: 6 },
        { key: 'remote',  label: 'عن بُعد',percent: 12, value: 1 },
        { key: 'late',    label: 'متأخر',   percent: 13, value: 1 },
      ],
      attendance: { present: 6, remote: 1, late: 1, absent: 0 },

      payroll: {
        monthLabel: 'أكتوبر 2026',
        progress:   80,
        cycle:      { prepared: 60, review: 25, approval: 15 },
      },

      approvals: [
        { id: 'ap1', tag: 'رواتب',  title: 'اعتماد مسيّر أكتوبر', sub: `${totalsOct.net.toLocaleString()} ج.م · 8 موظفين`, done: true },
        { id: 'ap2', tag: 'مكافأة', title: 'حافز فريق التصميم',   sub: 'ربع سنوي — Q3 2026',                          done: false },
        { id: 'ap3', tag: 'تعيين',  title: 'عرض عمل لياسمين فوزي', sub: 'مسوّقة محتوى',                               done: false },
      ],
      approvalsDone:  1,
      approvalsTotal: 3,

      accordion: DEPARTMENTS.slice(0, 4).map((d, i) => ({
        id: `acc_${i}`,
        title: d.name,
        rows: [
          { key: 'الموظفون', value: String(d.employees) },
          { key: 'الأداء', value: `${d.target + 3}%` },
          { key: 'المستهدف', value: `${d.target}%` },
        ],
      })),

      calendar: buildCalendar(),
    };
  }

  // checklist toggle
  if (cleanPath.startsWith('/dashboard/checklists/') && method === 'PATCH') {
    return { items: [], done: 1 };
  }

  // ===== EMPLOYEES =====
  if (cleanPath === '/employees' && method === 'GET') {
    const term = String(query.search || '').trim().toLowerCase();
    const dept = String(query.department || '').trim();

    let filtered = [...EMPLOYEES];
    if (term) {
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.code.toLowerCase().includes(term) ||
          e.dept.toLowerCase().includes(term) ||
          e.role.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term),
      );
    }
    if (dept) {
      filtered = filtered.filter((e) => e.dept === dept);
    }

    const mappedDepartments = DEPARTMENTS.map((d) => ({
      ...d,
      employees: EMPLOYEES.filter((e) => e.dept === d.name).length,
    }));

    return {
      employees: filtered.map(mapEmployee),
      total: filtered.length,
      departments: mappedDepartments,
    };
  }

  if (cleanPath === '/employees/departments') {
    return { departments: DEPARTMENTS };
  }

  if (cleanPath.match(/^\/employees\/[\w-]+$/) && method === 'GET') {
    const e = EMPLOYEES.find((x) => x.id === cleanPath.split('/')[2]);
    if (!e) throw { message: 'الموظف غير موجود' };
    return { employee: mapEmployee(e) };
  }

  if (cleanPath === '/employees' && method === 'POST') {
    const nextCode = `NSQ-0${Math.floor(200 + Math.random() * 800)}`;
    const n = {
      id: `emp-${Date.now()}`,
      code: nextCode,
      status: 'present',
      statusLabel: 'حاضر',
      kpi: 85,
      ...body,
      baseSalary: Number(body.baseSalary || body.salary || 12000),
      dept: body.dept || body.department || 'التطوير',
      role: body.role || body.position || 'موظف',
    };
    EMPLOYEES.push(n);
    return { employee: mapEmployee(n), message: 'تمت إضافة الموظف بنجاح' };
  }

  if (cleanPath.match(/^\/employees\/[\w-]+$/) && method === 'PATCH') {
    const i = EMPLOYEES.findIndex((x) => x.id === cleanPath.split('/')[2]);
    if (i === -1) throw { message: 'الموظف غير موجود' };
    EMPLOYEES[i] = { ...EMPLOYEES[i], ...body };
    return { employee: mapEmployee(EMPLOYEES[i]), message: 'تم التعديل' };
  }

  if (cleanPath.match(/^\/employees\/[\w-]+$/) && method === 'DELETE') {
    EMPLOYEES = EMPLOYEES.filter((x) => x.id !== cleanPath.split('/')[2]);
    return { ok: true, message: 'تم حذف الموظف' };
  }

  // ===== ATTENDANCE =====
  if (cleanPath === '/attendance/daily' || cleanPath === '/attendance') {
    const date = query.date || todayDate;
    const counts = {
      present: EMPLOYEES.filter((e) => e.status === 'present').length,
      remote:  EMPLOYEES.filter((e) => e.status === 'remote').length,
      late:    EMPLOYEES.filter((e) => e.status === 'late').length,
      absent:  EMPLOYEES.filter((e) => e.status === 'absent').length,
      leave:   EMPLOYEES.filter((e) => e.status === 'leave').length,
    };
    counts.total = EMPLOYEES.length;

    const rows = EMPLOYEES.map((emp) => ({
      employee: {
        id: emp.id,
        code: emp.code,
        name: emp.name,
        role: emp.role,
        dept: emp.dept,
      },
      record: {
        checkIn: emp.checkIn,
        checkOut: emp.checkOut,
        hours: emp.hours,
        status: emp.status,
        statusLabel: emp.statusLabel,
      },
      week: ['present', 'present', emp.status, 'present', 'present'],
    }));

    const weekDays = WEEK_NAMES.map((label, idx) => ({
      label,
      shortLabel: WEEK_SHORT[idx],
      name: label,
      date: todayDate,
      day: idx + 1,
    }));

    return {
      date,
      dateLabel: `${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      summary: counts,
      rows,
      weekDays,
    };
  }

  if (cleanPath === '/attendance/me') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    return {
      today: {
        date: todayDate,
        checkIn: emp.checkIn,
        checkOut: emp.checkOut,
        status: emp.status,
        statusLabel: emp.statusLabel,
        hours: emp.hours,
      },
      hoursThisWeek: 37.5,
      week: buildWeek(),
    };
  }

  if (cleanPath === '/attendance/check-in' && method === 'POST') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    const checkIn = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    emp.checkIn = checkIn;
    emp.status = 'present';
    emp.statusLabel = 'حاضر';
    return { checkIn, message: 'تم تسجيل الحضور بنجاح' };
  }

  if (cleanPath === '/attendance/check-out' && method === 'POST') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    const checkOut = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    emp.checkOut = checkOut;
    return { checkOut, message: 'تم تسجيل الانصراف بنجاح' };
  }

  // ===== LEAVES =====
  if (cleanPath === '/leaves' && method === 'GET') {
    const pending = LEAVES.filter((l) => l.status === 'pending').length;
    const balances = [
      { key: 'annual', label: 'إجازة سنوية', total: 21, used: 6, remaining: 15, percent: 28 },
      { key: 'sick',   label: 'إجازة مرضية', total: 14, used: 2, remaining: 12, percent: 14 },
      { key: 'casual', label: 'إجازة عارضة', total: 7,  used: 1, remaining: 6,  percent: 14 },
    ];
    return { leaves: LEAVES, balances, pending };
  }

  if (cleanPath === '/leaves/me') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    return { leaves: LEAVES.filter((l) => l.employeeId === emp.id) };
  }

  if (cleanPath === '/leaves/balance/me') {
    return {
      balance: { annual: 21, used: 6, remaining: 15, sick: 14, usedSick: 2 },
    };
  }

  if (cleanPath === '/leaves' && method === 'POST') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    const n = {
      id: `l_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeDept: emp.dept,
      type: body.type || 'annual',
      typeLabel: body.type === 'sick' ? 'مرضية' : 'اعتيادية',
      days: Number(body.days || 2),
      range: `${body.from || todayDate} ← ${body.to || todayDate}`,
      from: body.from || todayDate,
      to: body.to || todayDate,
      note: body.note || body.reason || '',
      status: 'pending',
      createdAt: todayDate,
    };
    LEAVES.unshift(n);
    return { leave: n, message: 'تم إرسال طلب الإجازة بنجاح' };
  }

  if (cleanPath.match(/^\/leaves\/[\w-]+\/decision$/) && method === 'PATCH') {
    const id = cleanPath.split('/')[2];
    const i = LEAVES.findIndex((l) => l.id === id);
    if (i !== -1) LEAVES[i] = { ...LEAVES[i], status: body.status };
    return { leave: LEAVES[i], message: body.status === 'approved' ? 'تمت الموافقة على الإجازة' : 'تم رفض الإجازة' };
  }

  // ===== REQUESTS =====
  if (cleanPath === '/requests/me') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    if (method === 'GET') {
      return { requests: REQUESTS.filter((r) => r.employeeId === emp.id) };
    }
    if (method === 'POST') {
      const typeLabels = {
        leave: 'إجازة اعتيادية',
        advance: 'سلفة',
        certificate: 'شهادة راتب',
        overtime: 'عمل إضافي',
      };
      const n = {
        id: `r_${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        type: body.type || 'leave',
        typeLabel: typeLabels[body.type] || 'طلب',
        note: body.note || body.body || '',
        range: body.from && body.to ? `${body.from} ← ${body.to}` : todayDate,
        status: 'pending',
        createdAt: todayDate,
      };
      REQUESTS.unshift(n);
      return { request: n, message: 'تم إرسال طلبك إلى الإدارة' };
    }
  }

  if (cleanPath === '/requests' && method === 'GET') {
    return { requests: REQUESTS };
  }

  if (cleanPath.match(/^\/requests\/[\w-]+\/status$/) && method === 'PATCH') {
    const id = cleanPath.split('/')[2];
    const i = REQUESTS.findIndex((r) => r.id === id);
    if (i !== -1) REQUESTS[i] = { ...REQUESTS[i], status: body.status };
    return { request: REQUESTS[i], message: 'تم تحديث حالة الطلب' };
  }

  // ===== PAYROLL =====
  if (cleanPath === '/payroll/runs' && method === 'GET') {
    return { runs: PAYROLL_RUNS };
  }

  if (cleanPath === '/payroll/runs/latest') {
    return { run: PAYROLL_RUNS[0] };
  }

  if (cleanPath.match(/^\/payroll\/runs\/[\w-]+$/) && method === 'GET') {
    const id = cleanPath.split('/')[3];
    const run = PAYROLL_RUNS.find((r) => r.id === id) || PAYROLL_RUNS[0];
    return { run, items: run.items };
  }

  if (cleanPath.match(/^\/payroll\/runs\/[\w-]+\/approve$/) && method === 'POST') {
    const id = cleanPath.split('/')[3];
    const i = PAYROLL_RUNS.findIndex((r) => r.id === id);
    if (i !== -1) {
      PAYROLL_RUNS[i] = {
        ...PAYROLL_RUNS[i],
        status: 'approved',
        statusLabel: 'معتمد',
        approvedAt: todayDate,
      };
    }
    return { run: PAYROLL_RUNS[i], message: 'تم اعتماد وصرف مسيّر الرواتب بنجاح' };
  }

  if (cleanPath === '/payroll/me/payslip') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    const base = emp.baseSalary;
    const allowances = [
      { label: 'الراتب الأساسي', value: base },
      { label: 'بدل انتقال', value: 1200 },
      { label: 'بدل اتصالات', value: 400 },
      { label: `حافز أداء (KPI ${emp.kpi}%)`, value: 2400 },
    ];
    const deductions = [
      { label: 'تأمينات اجتماعية 11%', value: Math.round(base * 0.11) },
      { label: 'ضريبة كسب العمل 6%', value: Math.round(base * 0.06) },
      { label: 'تأمين طبي شامل', value: 250 },
    ];
    const totalEarnings = allowances.reduce((s, a) => s + a.value, 0);
    const totalDeductions = deductions.reduce((s, d) => s + d.value, 0);
    const net = totalEarnings - totalDeductions;

    const periods = Array.from({ length: 4 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      return {
        month: m,
        year: y,
        label: `${MONTH_NAMES_AR[m - 1]} ${y}`,
      };
    });

    return {
      payslip: {
        month: Number(query.month || 10),
        year: Number(query.year || 2026),
        label: `${MONTH_NAMES_AR[Number(query.month || 10) - 1]} ${query.year || 2026}`,
        employee: {
          id: emp.id,
          code: emp.code,
          name: emp.name,
          role: emp.role,
          dept: emp.dept,
        },
        earnings: allowances,
        deductions,
        totals: {
          earnings: totalEarnings,
          deductions: totalDeductions,
          net,
        },
        status: 'approved',
        statusLabel: 'معتمد',
        bank: 'CIB ****4821',
        source: 'run',
      },
      periods,
    };
  }

  // ===== KPIS =====
  if (cleanPath === '/kpis' && method === 'GET') {
    const sorted = [...EMPLOYEES].sort((a, b) => b.kpi - a.kpi);
    const top    = sorted.slice(0, 5).map((e, i) => ({
      id: e.id,
      name: e.name,
      dept: e.dept,
      kpi: e.kpi,
      rank: i + 1,
    }));
    const avg = Math.round(EMPLOYEES.reduce((s, e) => s + e.kpi, 0) / EMPLOYEES.length);

    return {
      quarter: 'الربع الرابع (Q4 2026)',
      average: avg,
      avgScore: avg,
      top,
      employees: sorted.map((e, i) => ({
        id: e.id,
        name: e.name,
        dept: e.dept,
        role: e.role,
        goal: 'تحقيق أهداف الربع الرابع ومستهدفات القسم',
        kpi: e.kpi,
        rank: i + 1,
      })),
      departments: DEPARTMENTS.map((d) => ({
        ...d,
        score: d.target + 3,
      })),
    };
  }

  if (cleanPath === '/kpis/me') {
    const emp = EMPLOYEES.find((e) => e.email === user?.email) || EMPLOYEES[0];
    return { kpi: { employeeId: emp.id, score: emp.kpi, name: emp.name, dept: emp.dept } };
  }

  // ===== RECRUITMENT =====
  if (cleanPath === '/recruitment/board') {
    return buildRecruitmentBoard();
  }

  if (cleanPath === '/recruitment/candidates' && method === 'POST') {
    const n = {
      id: `cand_${Date.now()}`,
      name: body.name,
      title: body.title,
      stage: 0,
      appliedAt: todayDate,
    };
    CANDIDATES.unshift(n);
    return {
      candidate: n,
      board: buildRecruitmentBoard(),
      message: 'تمت إضافة المرشح بنجاح',
    };
  }

  if (cleanPath.match(/^\/recruitment\/candidates\/[\w-]+\/stage$/) && method === 'PATCH') {
    const id = cleanPath.split('/')[3];
    const candidate = CANDIDATES.find((c) => c.id === id);
    if (candidate) {
      candidate.stage = Number(body.stage);
    }
    return {
      board: buildRecruitmentBoard(),
      message: 'تم نقل المرشح إلى المرحلة التالية',
    };
  }

  if (cleanPath.match(/^\/recruitment\/candidates\/[\w-]+$/) && method === 'DELETE') {
    const id = cleanPath.split('/')[3];
    CANDIDATES = CANDIDATES.filter((c) => c.id !== id);
    return {
      board: buildRecruitmentBoard(),
      message: 'تم حذف المرشح بنجاح',
    };
  }

  // ===== SETTINGS =====
  if (cleanPath === '/settings') {
    return {
      companyName: 'شركة نسق',
      workHours: { start: '08:00', end: '17:00' },
      currency: 'EGP',
    };
  }

  throw { message: `Mock: مسار غير معروف — ${method} ${cleanPath}` };
}
