import { Router } from 'express';
import { z } from 'zod';

import { db } from '../lib/db.js';
import { hashPassword } from '../lib/password.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { employeeSummary } from '../services/hr.service.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

const employeeSchema = z.object({
  name: z.string().trim().min(2, 'الاسم مطلوب'),
  role: z.string().trim().min(2, 'المسمى الوظيفي مطلوب'),
  dept: z.string().trim().min(2, 'القسم مطلوب'),
  baseSalary: z.coerce.number().positive('الراتب يجب أن يكون أكبر من صفر'),
  status: z.enum(['present', 'remote', 'late', 'absent', 'leave']).optional(),
  email: z.string().trim().email('بريد إلكتروني غير صالح').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  hireDate: z.string().trim().optional(),
  kpi: z.coerce.number().min(0).max(100).optional(),
  goal: z.string().trim().optional(),
});

const statusLabel = {
  present: 'حاضر',
  remote: 'عن بُعد',
  late: 'متأخر',
  absent: 'غائب',
  leave: 'إجازة',
};

const serialize = (employee) => ({
  ...employeeSummary(employee),
  status: employee.statusCode || 'present',
  statusLabel: statusLabel[employee.statusCode] || 'حاضر',
});

router.get('/', (req, res) => {
  const { search = '', department = '', status = '' } = req.query;
  const term = String(search).trim().toLowerCase();

  const employees = db.data.employees
    .filter((employee) => {
      const matchesSearch =
        !term ||
        [employee.name, employee.role, employee.dept, employee.code, employee.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      const matchesDepartment = !department || employee.dept === department;
      const matchesStatus = !status || employee.statusCode === status;
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .map(serialize);

  res.json({
    employees,
    total: employees.length,
    departments: db.data.departments,
  });
});

router.get('/departments', (req, res) => {
  const departments = db.data.departments.map((department) => ({
    ...department,
    employees: db.data.employees.filter((employee) => employee.dept === department.name).length,
  }));

  res.json({ departments });
});

router.get('/:id', (req, res) => {
  const employee = db.findOne('employees', (row) => row.id === req.params.id);
  if (!employee) throw new ApiError(404, 'الموظف غير موجود');
  res.json({ employee: serialize(employee) });
});

router.post(
  '/',
  requireRole('hr'),
  validate(employeeSchema),
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const nextNumber =
      Math.max(
        1000,
        ...db.data.employees.map((employee) => Number(employee.code.split('-')[1]) || 1000),
      ) + 1;

    const employee = db.insert(
      'employees',
      {
        code: `NSQ-${String(nextNumber).padStart(4, '0')}`,
        name: payload.name,
        role: payload.role,
        dept: payload.dept,
        baseSalary: payload.baseSalary,
        status: statusLabel[payload.status] || 'حاضر',
        statusCode: payload.status || 'present',
        checkIn: payload.status && payload.status !== 'absent' ? '08:55' : null,
        kpi: payload.kpi ?? 80,
        goal: payload.goal || 'لم يتم تحديد مؤشر بعد',
        email: payload.email || '',
        phone: payload.phone || '',
        hireDate: payload.hireDate || new Date().toISOString().slice(0, 10),
        weekTemplate: ['p', 'p', 'p', 'p', 'p'],
      },
      'emp',
    );

    if (payload.email) {
      db.insert(
        'users',
        {
          name: employee.name,
          email: payload.email,
          role: 'emp',
          employeeId: employee.id,
          passwordHash: hashPassword('123456'),
        },
        'usr',
      );
    }

    res.status(201).json({ employee: serialize(employee) });
  }),
);

router.patch(
  '/:id',
  requireRole('hr'),
  validate(employeeSchema.partial()),
  asyncHandler(async (req, res) => {
    const employee = db.findOne('employees', (row) => row.id === req.params.id);
    if (!employee) throw new ApiError(404, 'الموظف غير موجود');

    const patch = { ...req.body };
    if (patch.status) {
      patch.statusCode = patch.status;
      patch.status = statusLabel[patch.status] || 'حاضر';
    }
    if (patch.baseSalary) patch.baseSalary = Number(patch.baseSalary);
    if (patch.kpi !== undefined) patch.kpi = Number(patch.kpi);

    const updated = db.update('employees', employee.id, patch);
    res.json({ employee: serialize(updated) });
  }),
);

router.delete(
  '/:id',
  requireRole('hr'),
  asyncHandler(async (req, res) => {
    const employee = db.findOne('employees', (row) => row.id === req.params.id);
    if (!employee) throw new ApiError(404, 'الموظف غير موجود');

    db.remove('employees', employee.id);
    db.data.users = db.data.users.filter((user) => user.employeeId !== employee.id);
    db.save();

    res.json({ message: 'تم حذف الموظف' });
  }),
);

export default router;
