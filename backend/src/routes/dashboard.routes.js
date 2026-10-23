import { Router } from 'express';

import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  employeeDashboard,
  hrDashboard,
  managementDashboard,
} from '../services/hr.service.js';
import { ApiError } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

router.get('/employee', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');
  res.json(employeeDashboard(req.employee));
});

router.get('/hr', requireRole('hr'), (req, res) => {
  res.json(hrDashboard(req.user));
});

router.get('/management', requireRole('mgmt'), (req, res) => {
  res.json(managementDashboard(req.user));
});

router.patch(
  '/checklists/:list/:id',
  requireRole('hr', 'mgmt'),
  (req, res, next) => {
    try {
      const { list, id } = req.params;
      const allowed = ['payrollReadiness', 'approvals'];

      if (!allowed.includes(list)) throw new ApiError(404, 'القائمة غير موجودة');

      const items = db.data.checklists[list];
      const item = items.find((row) => row.id === id);
      if (!item) throw new ApiError(404, 'العنصر غير موجود');

      item.done = !item.done;
      db.save();

      res.json({ item, items, done: items.filter((row) => row.done).length });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
