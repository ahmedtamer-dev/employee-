import { Router } from 'express';
import { z } from 'zod';

import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  computePayrollAmounts,
  getEmployeePayslip,
  serializeRun,
} from '../services/payroll.service.js';
import { addDays, monthName, toISODate } from '../utils/date.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

const createRunSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

router.get('/runs', requireRole('hr', 'mgmt'), (req, res) => {
  const runs = db.data.payrollRuns
    .map(serializeRun)
    .sort((a, b) => b.year * 100 + b.month - (a.year * 100 + a.month));

  res.json({ runs });
});

router.get('/runs/latest', requireRole('hr', 'mgmt'), (req, res) => {
  const run = [...db.data.payrollRuns].sort(
    (a, b) => b.year * 100 + b.month - (a.year * 100 + a.month),
  )[0];

  if (!run) throw new ApiError(404, 'لا يوجد مسيّر رواتب بعد');
  res.json({ run: serializeRun(run) });
});

router.get('/runs/:id', requireRole('hr', 'mgmt'), (req, res) => {
  const run = db.findOne('payrollRuns', (row) => row.id === req.params.id);
  if (!run) throw new ApiError(404, 'مسيّر الرواتب غير موجود');
  res.json({ run: serializeRun(run) });
});

router.post(
  '/runs',
  requireRole('hr'),
  validate(createRunSchema),
  asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const exists = db.findOne(
      'payrollRuns',
      (row) => row.month === month && row.year === year,
    );

    if (exists) throw new ApiError(409, 'يوجد مسيّر رواتب لهذا الشهر بالفعل');

    const items = db.data.employees.map((employee) => {
      const amounts = computePayrollAmounts(employee);
      return {
        id: db.generateId('pay'),
        employeeId: employee.id,
        base: amounts.base,
        allowances: amounts.allowances,
        deductions: amounts.deductions,
        net: amounts.net,
        status: 'review',
      };
    });

    const run = db.insert(
      'payrollRuns',
      {
        month,
        year,
        label: `${monthName(month)} ${year}`,
        status: 'draft',
        payDate: toISODate(addDays(new Date(year, month - 1, 25), 3)),
        approvedAt: null,
        items,
      },
      'run',
    );

    res.status(201).json({ run: serializeRun(run), message: 'تم إنشاء مسيّر الرواتب' });
  }),
);

router.post(
  '/runs/:id/approve',
  requireRole('hr', 'mgmt'),
  asyncHandler(async (req, res) => {
    const run = db.findOne('payrollRuns', (row) => row.id === req.params.id);
    if (!run) throw new ApiError(404, 'مسيّر الرواتب غير موجود');
    if (run.status === 'approved') throw new ApiError(409, 'تم اعتماد المسيّر بالفعل');

    const updated = db.update('payrollRuns', run.id, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: req.user.id,
      items: run.items.map((item) => ({ ...item, status: 'approved' })),
    });

    res.json({ run: serializeRun(updated), message: 'تم اعتماد وصرف الرواتب' });
  }),
);

router.get('/me/periods', (req, res) => {
  const now = new Date();
  const periods = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: monthName(date.getMonth() + 1),
    };
  });

  res.json({ periods });
});

router.get('/me/payslip', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

  const now = new Date();
  const month = Number(req.query.month || now.getMonth() + 1);
  const year = Number(req.query.year || now.getFullYear());

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ApiError(422, 'الشهر غير صالح');
  }

  const payslip = getEmployeePayslip(req.employee, month, year);
  const periods = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: monthName(date.getMonth() + 1),
    };
  });

  res.json({ payslip, periods });
});

export default router;
