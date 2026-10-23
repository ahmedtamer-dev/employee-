import { Router } from 'express';

import attendanceRoutes from './attendance.routes.js';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import employeesRoutes from './employees.routes.js';
import kpisRoutes from './kpis.routes.js';
import leavesRoutes from './leaves.routes.js';
import payrollRoutes from './payroll.routes.js';
import recruitmentRoutes from './recruitment.routes.js';
import requestsRoutes from './requests.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nasaq-hr-api',
    time: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/employees', employeesRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leavesRoutes);
router.use('/requests', requestsRoutes);
router.use('/payroll', payrollRoutes);
router.use('/kpis', kpisRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

export default router;
