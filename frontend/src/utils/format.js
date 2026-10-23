const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getActiveLang = () => {
  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('lang') || localStorage.getItem('nasaq_lang') || 'ar';
  }
  return 'ar';
};

export const money = (value) =>
  Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

export const moneyWithCurrency = (value, lang) => {
  const currentLang = lang || getActiveLang();
  return `${money(value)} ${currentLang === 'en' ? 'EGP' : 'ج.م'}`;
};

export const percent = (value) => `${Math.round(Number(value) || 0)}%`;

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');

const parseDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

export const dayName = (value, lang) => {
  const currentLang = lang || getActiveLang();
  const d = parseDate(value).getDay();
  return currentLang === 'en' ? DAYS_EN[d] : DAYS_AR[d];
};

export const shortDate = (value, lang) => {
  if (!value) return '—';
  const currentLang = lang || getActiveLang();
  const date = parseDate(value);
  if (currentLang === 'en') {
    return `${MONTHS_SHORT_EN[date.getMonth()]} ${date.getDate()}`;
  }
  return `${date.getDate()} ${MONTHS_AR[date.getMonth()]}`;
};

export const fullDate = (value = new Date(), lang) => {
  const currentLang = lang || getActiveLang();
  const date = parseDate(value);
  if (currentLang === 'en') {
    return `${DAYS_EN[date.getDay()]}, ${MONTHS_EN[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  return `${DAYS_AR[date.getDay()]}، ${date.getDate()} ${MONTHS_AR[date.getMonth()]} ${date.getFullYear()}`;
};

export const monthLabel = (month, year, lang) => {
  const currentLang = lang || getActiveLang();
  const m = Number(month) - 1;
  const monthName = currentLang === 'en' ? (MONTHS_EN[m] || '') : (MONTHS_AR[m] || '');
  return `${monthName} ${year || ''}`.trim();
};

const STATUS_DICTIONARY = {
  ar: {
    present: 'حاضر',
    remote: 'عن بُعد',
    late: 'متأخر',
    absent: 'غائب',
    leave: 'إجازة',
  },
  en: {
    present: 'Present',
    remote: 'Remote',
    late: 'Late',
    absent: 'Absent',
    leave: 'On Leave',
  },
};

export const STATUS_LABELS = new Proxy({}, {
  get: (_, prop) => {
    const lang = getActiveLang();
    return STATUS_DICTIONARY[lang]?.[prop] || STATUS_DICTIONARY.ar[prop] || prop;
  }
});

export const STATUS_TONES = {
  present: 'green',
  remote: 'blue',
  late: 'amber',
  absent: 'red',
  leave: 'gray',
};

const LEAVE_DICTIONARY = {
  ar: {
    annual: 'إجازة اعتيادية',
    casual: 'إجازة عارضة',
    sick: 'إجازة مرضية',
    unpaid: 'إجازة بدون أجر',
  },
  en: {
    annual: 'Annual Leave',
    casual: 'Casual Leave',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leave',
  },
};

export const LEAVE_LABELS = new Proxy({}, {
  get: (_, prop) => {
    const lang = getActiveLang();
    return LEAVE_DICTIONARY[lang]?.[prop] || LEAVE_DICTIONARY.ar[prop] || prop;
  }
});

const REQUEST_DICTIONARY = {
  ar: {
    leave: 'طلب إجازة',
    advance: 'طلب سلفة',
    certificate: 'شهادة راتب',
    overtime: 'عمل إضافي',
  },
  en: {
    leave: 'Leave Request',
    advance: 'Salary Advance',
    certificate: 'Salary Certificate',
    overtime: 'Overtime Permit',
  },
};

export const REQUEST_LABELS = new Proxy({}, {
  get: (_, prop) => {
    const lang = getActiveLang();
    return REQUEST_DICTIONARY[lang]?.[prop] || REQUEST_DICTIONARY.ar[prop] || prop;
  }
});

export const REQUEST_TONES = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
  delivered: 'green',
};

const badgeTones = {
  approved: 'green',
  review: 'amber',
  hold: 'red',
  draft: 'gray',
  calculated: 'blue',
};

export const payrollTone = (status) => badgeTones[status] || 'gray';

export const kpiTone = (value) => (value >= 90 ? 'green' : value >= 80 ? 'blue' : 'amber');
