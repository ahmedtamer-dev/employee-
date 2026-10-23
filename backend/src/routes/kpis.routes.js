import { Router } from 'express';
import { z } from 'zod';

import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { kpiOverview } from '../services/kpi.service.js';
import { employeeSummary } from '../services/hr.service.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('hr', 'mgmt'), (req, res) => {
  res.json(kpiOverview());
});

router.get('/me', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

  res.json({
    employee: employeeSummary(req.employee),
    kpis: [
      { id: 'goal', name: req.employee.goal, progress: req.employee.kpi, value: `${req.employee.kpi}%` },
      { id: 'team', name: 'رضا فريق العمل', progress: 94, value: '4.7/5' },
      { id: 'training', name: 'حضور ورش التعلّم', progress: 80, value: '4/5' },
    ],
  });
});

router.patch(
  '/:employeeId',
  requireRole('hr'),
  validate(
    z.object({
      kpi: z.coerce.number().min(0).max(100).optional(),
      goal: z.string().trim().min(2).optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const employee = db.findOne('employees', (row) => row.id === req.params.employeeId);
    if (!employee) throw new ApiError(404, 'الموظف غير موجود');

    const updated = db.update('employees', employee.id, req.body);
    res.json({
      employee: {
        ...employeeSummary(updated),
        goal: updated.goal,
        kpi: updated.kpi,
      },
      message: 'تم تحديث مؤشر الأداء',
    });
  }),
);

export default router;
