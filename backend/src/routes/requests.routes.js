import { Router } from 'express';
import { z } from 'zod';

import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { serializeRequest } from '../services/hr.service.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

router.get('/me', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

  const requests = db
    .find('requests', (row) => row.employeeId === req.employee.id)
    .map(serializeRequest)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ requests });
});

router.post(
  '/me',
  validate(
    z.object({
      type: z.enum(['leave', 'advance', 'certificate', 'overtime']),
      from: z.string().optional().nullable(),
      to: z.string().optional().nullable(),
      note: z.string().trim().max(500).optional().default(''),
    }),
  ),
  asyncHandler(async (req, res) => {
    if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

    const request = db.insert(
      'requests',
      {
        employeeId: req.employee.id,
        type: req.body.type,
        from: req.body.from || null,
        to: req.body.to || null,
        note: req.body.note || '',
        status: 'pending',
        requestedAt: new Date().toISOString(),
      },
      'req',
    );

    res.status(201).json({ request: serializeRequest(request), message: 'تم إرسال الطلب' });
  }),
);

router.get('/', requireRole('hr'), (req, res) => {
  const status = String(req.query.status || '');
  const requests = db.data.requests
    .filter((request) => !status || request.status === status)
    .map(serializeRequest)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ requests, pending: requests.filter((row) => row.status === 'pending').length });
});

router.patch(
  '/:id/status',
  requireRole('hr'),
  validate(z.object({ status: z.enum(['approved', 'rejected', 'delivered']) })),
  asyncHandler(async (req, res) => {
    const request = db.findOne('requests', (row) => row.id === req.params.id);
    if (!request) throw new ApiError(404, 'الطلب غير موجود');

    const updated = db.update('requests', request.id, {
      status: req.body.status,
      decidedAt: new Date().toISOString(),
      decidedBy: req.user.id,
    });

    res.json({ request: serializeRequest(updated), message: 'تم تحديث حالة الطلب' });
  }),
);

export default router;
