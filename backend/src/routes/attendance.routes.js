import { Router } from 'express';

import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  STATUS_LABELS,
  attendanceSummary,
  dailyAttendance,
  employeeWeek,
} from '../services/hr.service.js';
import { hoursBetween, minutesToClock, todayISO } from '../utils/date.js';
import { ApiError } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

const nowClock = () => {
  const now = new Date();
  return minutesToClock(now.getHours() * 60 + now.getMinutes());
};

const statusForCheckIn = (clock) => (clock > '09:00' ? 'late' : 'present');

router.get('/', requireRole('hr', 'mgmt'), (req, res) => {
  const date = String(req.query.date || todayISO());
  const records = db
    .find('attendance', (row) => row.date === date)
    .map((record) => {
      const employee = db.findOne('employees', (row) => row.id === record.employeeId);
      return {
        ...record,
        statusLabel: STATUS_LABELS[record.status],
        employee: employee
          ? { id: employee.id, name: employee.name, dept: employee.dept, role: employee.role }
          : null,
      };
    });

  res.json({ date, summary: attendanceSummary(date), records });
});

router.get('/summary', requireRole('hr', 'mgmt'), (req, res) => {
  res.json({ summary: attendanceSummary(String(req.query.date || todayISO())) });
});

router.get('/daily', requireRole('hr', 'mgmt'), (req, res) => {
  res.json(dailyAttendance(String(req.query.date || todayISO())));
});

router.get('/me', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

  const today = todayISO();
  const record = db.findOne(
    'attendance',
    (row) => row.employeeId === req.employee.id && row.date === today,
  );
  const week = employeeWeek(req.employee.id);

  res.json({
    today: {
      date: today,
      status: record?.status || null,
      statusLabel: record ? STATUS_LABELS[record.status] : 'لم يُسجَّل',
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      hours: record?.hours ?? null,
    },
    week,
    hoursThisWeek:
      Math.round(week.reduce((sum, day) => sum + (day.hours || 0), 0) * 10) / 10,
  });
});

router.post('/check-in', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

  const today = todayISO();
  const existing = db.findOne(
    'attendance',
    (row) => row.employeeId === req.employee.id && row.date === today,
  );

  if (existing?.checkIn) {
    throw new ApiError(409, 'تم تسجيل الحضور بالفعل اليوم');
  }

  const checkIn = nowClock();
  const record = existing
    ? db.update('attendance', existing.id, {
        checkIn,
        checkOut: null,
        hours: null,
        status: statusForCheckIn(checkIn),
      })
    : db.insert('attendance', {
        employeeId: req.employee.id,
        date: today,
        status: statusForCheckIn(checkIn),
        checkIn,
        checkOut: null,
        hours: null,
        note: null,
      });

  res.status(201).json({
    record: { ...record, statusLabel: STATUS_LABELS[record.status] },
    message: 'تم تسجيل الحضور',
  });
});

router.post('/check-out', (req, res) => {
  if (!req.employee) throw new ApiError(404, 'لا يوجد ملف موظف مرتبط بهذا الحساب');

  const today = todayISO();
  const record = db.findOne(
    'attendance',
    (row) => row.employeeId === req.employee.id && row.date === today,
  );

  if (!record?.checkIn) throw new ApiError(400, 'لم يتم تسجيل الحضور اليوم بعد');
  if (record.checkOut) throw new ApiError(409, 'تم تسجيل الانصراف بالفعل اليوم');

  const checkOut = nowClock();
  const updated = db.update('attendance', record.id, {
    checkOut,
    hours: hoursBetween(record.checkIn, checkOut),
  });

  res.json({
    record: { ...updated, statusLabel: STATUS_LABELS[updated.status] },
    message: 'تم تسجيل الانصراف',
  });
});

export default router;
