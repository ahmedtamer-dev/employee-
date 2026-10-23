import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

/**
 * يشفر كلمة المرور باستخدام scrypt ويعيدها بالصيغة: salt:hash
 */
export function hashPassword(plainPassword) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plainPassword, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * يتحقق من كلمة المرور مقابل القيمة المشفرة.
 */
export function verifyPassword(plainPassword, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) return false;

  const [salt, hash] = storedPassword.split(':');
  const storedBuffer = Buffer.from(hash, 'hex');
  const candidate = scryptSync(plainPassword, salt, storedBuffer.length);

  if (candidate.length !== storedBuffer.length) return false;
  return timingSafeEqual(candidate, storedBuffer);
}
