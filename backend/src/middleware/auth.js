import { db } from '../lib/db.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/index.js';
import jwt from 'jsonwebtoken';

/**
 * يتحقق من JWT ويضيف req.user و req.employee للطلب.
 */
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'مطلوب تسجيل الدخول للمتابعة'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = db.findOne('users', (row) => row.id === payload.sub);

    if (!user) {
      return next(new ApiError(401, 'الجلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى'));
    }

    req.user = user;
    req.employee = user.employeeId
      ? db.findOne('employees', (row) => row.id === user.employeeId)
      : null;
    return next();
  } catch {
    return next(new ApiError(401, 'الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى'));
  }
};

/**
 * يقيد الوصول لأدوار محددة.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'لا تملك صلاحية تنفيذ هذا الإجراء'));
  }
  return next();
};
