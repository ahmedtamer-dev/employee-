const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const AR_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const pad = (value) => String(value).padStart(2, '0');

export const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayISO = () => toISODate(new Date());

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const startOfWeek = (date = new Date()) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay()); // الأحد بداية الأسبوع
  return next;
};

export const timeToMinutes = (time) => {
  if (!time || !time.includes(':')) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const clockToMinutes = (date) => date.getHours() * 60 + date.getMinutes();

export const minutesToClock = (totalMinutes) => {
  const minutes = Math.max(0, Math.round(totalMinutes));
  return `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;
};

export const hoursBetween = (from, to) => {
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);
  if (start === null || end === null) return null;
  return Math.round(((end - start) / 60) * 10) / 10;
};

export const monthName = (month) => AR_MONTHS[month - 1] || '';

/**
 * يحول نص التاريخ (YYYY-MM-DD) إلى تاريخ محلي بدل تفسيره كـ UTC
 * لتجنب إزاحة اليوم في المناطق الزمنية السالبة.
 */
export const parseDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

export const dayName = (date) => AR_DAYS[parseDate(date).getDay()];

export const formatArabicDate = (value) => {
  const date = parseDate(value);
  return `${dayName(date)}، ${date.getDate()} ${monthName(date.getMonth() + 1)} ${date.getFullYear()}`;
};

export const formatShortDate = (value) => {
  const date = parseDate(value);
  return `${date.getDate()} ${monthName(date.getMonth() + 1)}`;
};

