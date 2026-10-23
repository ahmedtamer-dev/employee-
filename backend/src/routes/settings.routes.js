import { Router } from 'express';

import { db } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  LEAVE_TYPE_LABELS,
  REQUEST_TYPE_LABELS,
  STATUS_LABELS,
} from '../services/hr.service.js';
import { monthName } from '../utils/date.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({
    settings: db.data.settings,
    departments: db.data.departments,
    labels: {
      attendance: STATUS_LABELS,
      leaves: LEAVE_TYPE_LABELS,
      requests: REQUEST_TYPE_LABELS,
      payroll: {
        approved: 'معتمد',
        review: 'قيد المراجعة',
        hold: 'مُعلّق',
        draft: 'مسودة',
      },
    },
    currentMonth: monthName(new Date().getMonth() + 1),
  });
});

export default router;
