import { Router } from 'express';
import { z } from 'zod';

import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  LEAVE_TYPE_LABELS,
  leaveBalances,
  leaveBalancesAverage,
  serializeLeave,
} from '../services/hr.service.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

const createLeaveSchema = z
  .object({
    type: z.enum(['annual', 'casual', 'sick', 'unpaid']),
    from: z.string().min(8, 'تاريخ البداية مطلوب'),
    to: z.string().min(8, 'تاريخ النهاية مطلوب'),
    note: z.string().trim().max(500).optional().default(''),
  })
  .refine((value) => value.to >= value.from, {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['to'],
  });

const daysBetween = (from, to) =>
  Math.max(1, Math.round((new Date(to) - new Date(from)) / 86_400_000) + 1);

router.get('/balance/me', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');
  res.json({ balances: leaveBalances(req.employee.id), average: leaveBalancesAverage() });
});

router.get('/balance/company', requireRole('hr', 'mgmt'), (req, res) => {
  res.json({ balances: leaveBalancesAverage() });
});

router.get('/me', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

  const leaves = db
    .find('leaves', (row) => row.employeeId === req.employee.id)
    .map(serializeLeave)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  res.json({
    leaves,
    balances: leaveBalances(req.employee.id),
    pending: leaves.filter((leave) => leave.status === 'pending').length,
  });
});

router.get('/', requireRole('hr', 'mgmt'), (req, res) => {
  const status = String(req.query.status || '');
  const leaves = db.data.leaves
    .filter((leave) => !status || leave.status === status)
    .map(serializeLeave)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  res.json({
    leaves,
    pending: leaves.filter((leave) => leave.status === 'pending').length,
    balances: leaveBalancesAverage(),
    types: LEAVE_TYPE_LABELS,
  });
});

router.post(
  '/',
  validate(createLeaveSchema),
  asyncHandler(async (req, res) => {
    if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

    const leave = db.insert(
      'leaves',
      {
        employeeId: req.employee.id,
        type: req.body.type,
        from: req.body.from,
        to: req.body.to,
        days: daysBetween(req.body.from, req.body.to),
        note: req.body.note || '',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        decidedAt: null,
        decidedBy: null,
      },
      'leave',
    );

    res.status(201).json({ leave: serializeLeave(leave), message: 'تم إرسال الطلب' });
  }),
);

router.patch(
  '/:id/decision',
  requireRole('hr'),
  validate(z.object({ status: z.enum(['approved', 'rejected']) })),
  asyncHandler(async (req, res) => {
    const leave = db.findOne('leaves', (row) => row.id === req.params.id);
    if (!leave) throw new ApiError(404, 'الطلب غير موجود');

    const updated = db.update('leaves', leave.id, {
      status: req.body.status,
      decidedAt: new Date().toISOString(),
      decidedBy: req.user.id,
    });

    res.json({
      leave: serializeLeave(updated),
      message: req.body.status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب',
    });
  }),
);

export default router;
