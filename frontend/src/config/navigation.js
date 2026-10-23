export const ROLE_META = {
  emp: { label: 'موظف', shortLabel: 'موظف', home: '/home' },
  hr: { label: 'الموارد البشرية', shortLabel: 'HR', home: '/hr' },
  mgmt: { label: 'الإدارة التنفيذية', shortLabel: 'الإدارة', home: '/dashboard' },
};

export const NAV_ITEMS = {
  emp: [
    { to: '/home', label: 'الرئيسية' },
    { to: '/payslip', label: 'قسيمة الراتب' },
    { to: '/requests', label: 'طلباتي' },
  ],
  hr: [
    { to: '/hr', label: 'الرئيسية' },
    { to: '/hiring', label: 'التوظيف' },
    { to: '/employees', label: 'الموظفين' },
    { to: '/attendance', label: 'الحضور والانصراف' },
    { to: '/payroll', label: 'الرواتب' },
    { to: '/leaves', label: 'الإجازات' },
  ],
  mgmt: [
    { to: '/dashboard', label: 'الرئيسية' },
    { to: '/kpis', label: 'مؤشرات الأداء' },
    { to: '/payroll', label: 'الرواتب' },
    { to: '/employees', label: 'الموظفين' },
  ],
};

export const getRoleMeta = (role) => ROLE_META[role] || ROLE_META.emp;
export const getNavItems = (role) => NAV_ITEMS[role] || [];
export const homeFor = (role) => ROLE_META[role]?.home || '/login';

