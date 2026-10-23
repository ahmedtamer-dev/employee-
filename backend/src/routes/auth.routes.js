import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../config/env.js';
import { db } from '../lib/db.js';
import { verifyPassword } from '../lib/password.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { employeeSummary } from '../services/hr.service.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email('بريد إلكتروني غير صالح'),
  password: z.string().min(4, 'كلمة المرور قصيرة جدًا'),
});

const publicUser = (user) => {
  const employee = user.employeeId
    ? db.findOne('employees', (row) => row.id === user.employeeId)
    : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    employee: employeeSummary(employee),
  };
};

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = db.findOne(
      'users',
      (row) => row.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new ApiError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, employeeId: user.employeeId },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn },
    );

    res.json({ token, user: publicUser(user) });
  }),
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.get('/demo-accounts', (req, res) => {
  const accounts = [
    { role: 'emp', label: 'موظف', email: 'ahmed@nasaq.co' },
    { role: 'hr', label: 'الموارد البشرية', email: 'mona@nasaq.co' },
    { role: 'mgmt', label: 'الإدارة', email: 'khaled@nasaq.co' },
  ];

  res.json({
    password: db.data.meta.demoPassword || '123456',
    accounts,
  });
});

export default router;
