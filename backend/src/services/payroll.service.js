import { db } from '../lib/db.js';
import { monthName } from '../utils/date.js';
import { ApiError } from '../utils/index.js';

export const ALLOWANCE_TRANSPORT = 1200;
export const ALLOWANCE_PHONE = 400;
export const MEDICAL_DEDUCTION = 250;

export const PAYROLL_STATUS_LABELS = {
  approved: 'معتمد',
  review: 'قيد المراجعة',
  hold: 'مُعلّق',
  draft: 'مسودة',
};

export const computePayrollAmounts = (employee) => {
  const base = employee.baseSalary;
  const allowances = Math.round(base * (employee.kpi >= 90 ? 0.2 : 0.12));
  const latePenalty = employee.statusCode === 'late' ? 250 : 0;
  const absencePenalty = employee.statusCode === 'absent' ? Math.round(base / 30) : 0;
  const deductions =
    Math.round(base * 0.11) + Math.round(base * 0.06) + MEDICAL_DEDUCTION + latePenalty + absencePenalty;

  return {
    base,
    allowances,
    deductions,
    net: base + allowances - deductions,
    latePenalty,
    absencePenalty,
  };
};

export const buildEarnings = (employee, factor = 1, amounts = computePayrollAmounts(employee)) => {
  const performance = Math.max(0, amounts.allowances - ALLOWANCE_TRANSPORT - ALLOWANCE_PHONE);

  return [
    { label: 'الراتب الأساسي', value: Math.round(amounts.base * factor) },
    { label: 'بدل انتقال', value: ALLOWANCE_TRANSPORT },
    { label: 'بدل اتصالات', value: ALLOWANCE_PHONE },
    {
      label: `حافز أداء (KPI ${employee.kpi}%)`,
      value: Math.round(performance * factor),
    },
  ];
};

export const buildDeductions = (employee, amounts = computePayrollAmounts(employee)) =>
  [
    { label: 'تأمينات اجتماعية 11%', value: Math.round(amounts.base * 0.11) },
    { label: 'ضريبة كسب العمل', value: Math.round(amounts.base * 0.06) },
    { label: 'تأمين طبي', value: MEDICAL_DEDUCTION },
    amounts.latePenalty ? { label: 'خصم تأخير', value: amounts.latePenalty } : null,
    amounts.absencePenalty ? { label: 'خصم غياب', value: amounts.absencePenalty } : null,
  ].filter(Boolean);

export const payrollRunTotals = (run) => {
  const totals = run.items.reduce(
    (accumulator, item) => ({
      base: accumulator.base + item.base,
      allowances: accumulator.allowances + item.allowances,
      deductions: accumulator.deductions + item.deductions,
      net: accumulator.net + item.net,
    }),
    { base: 0, allowances: 0, deductions: 0, net: 0 },
  );

  return {
    count: run.items.length,
    base: totals.base,
    allowances: totals.allowances,
    deductions: totals.deductions,
    net: totals.net,
  };
};

export const serializeRun = (run) => ({
  ...run,
  statusLabel: PAYROLL_STATUS_LABELS[run.status] || run.status,
  label: run.label || `${monthName(run.month)} ${run.year}`,
  items: run.items.map((item) => {
    const employee = db.findOne('employees', (row) => row.id === item.employeeId);
    return {
      ...item,
      statusLabel: PAYROLL_STATUS_LABELS[item.status] || item.status,
      employee: employee
        ? { id: employee.id, name: employee.name, dept: employee.dept, role: employee.role }
        : null,
    };
  }),
  totals: payrollRunTotals(run),
});

export const getEmployeePayslip = (employee, month, year) => {
  if (!employee) {
    throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');
  }

  const run = db.findOne(
    'payrollRuns',
    (row) => row.month === Number(month) && row.year === Number(year),
  );
  const item = run?.items.find((row) => row.employeeId === employee.id);
  const amounts = computePayrollAmounts(employee);

  if (item) {
    const earnings = buildEarnings(employee, 1, amounts);
    const deductions = buildDeductions(employee, amounts);

    return {
      month: Number(month),
      year: Number(year),
      label: `${monthName(Number(month))} ${year}`,
      employee: {
        id: employee.id,
        name: employee.name,
        code: employee.code,
        role: employee.role,
        dept: employee.dept,
      },
      earnings,
      deductions,
      totals: {
        earnings: earnings.reduce((sum, row) => sum + row.value, 0),
        deductions: deductions.reduce((sum, row) => sum + row.value, 0),
        net: item.net,
      },
      status: item.status,
      statusLabel: PAYROLL_STATUS_LABELS[item.status] || item.status,
      bank: 'CIB ****4821',
      source: 'run',
    };
  }

  // لم يتم إنشاء مسيّر لهذا الشهر بعد: نحسب قيمة تقديرية بنفس المعادلة.
  const now = new Date();
  const monthsBack = (now.getFullYear() - Number(year)) * 12 + (now.getMonth() + 1 - Number(month));
  const factor = monthsBack >= 3 ? 0.92 : monthsBack === 2 ? 0.95 : monthsBack === 1 ? 0.97 : 1;
  const earnings = buildEarnings(employee, factor, amounts);
  const deductions = buildDeductions(employee, amounts);

  return {
    month: Number(month),
    year: Number(year),
    label: `${monthName(Number(month))} ${year}`,
    employee: {
      id: employee.id,
      name: employee.name,
      code: employee.code,
      role: employee.role,
      dept: employee.dept,
    },
    earnings,
    deductions,
    totals: {
      earnings: earnings.reduce((sum, row) => sum + row.value, 0),
      deductions: deductions.reduce((sum, row) => sum + row.value, 0),
      net:
        earnings.reduce((sum, row) => sum + row.value, 0) -
        deductions.reduce((sum, row) => sum + row.value, 0),
    },
    status: 'calculated',
    statusLabel: 'تقديري',
    bank: 'CIB ****4821',
    source: 'calculated',
  };
};
