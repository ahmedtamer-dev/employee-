import { mockRequest } from './mock.js';

const TOKEN_KEY = 'nasaq.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// وضع الـ mock: يُفعَّل تلقائياً إذا لم يكن هناك backend
const FORCE_MOCK = false; // يتم الاتصال بالسيرفر الحقيقي تلقائياً مع الرجوع للمحاكاة عند الحاجة

const buildQuery = (query = {}) => {
  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString()}`;
};

export async function request(path, { method = 'GET', body, query } = {}) {
  const token = getToken();

  // استخدام الـ mock مباشرة إذا كان مُجبراً
  if (FORCE_MOCK) {
    try {
      return await mockRequest(path, { method, body, query }, token);
    } catch (err) {
      const msg = err?.message || 'حدث خطأ غير متوقع';
      throw new Error(msg);
    }
  }

  // اتصال حقيقي بالسيرفر
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`/api${path}${buildQuery(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fallback للـ mock لو السيرفر مش شغّال
    try {
      return await mockRequest(path, { method, body, query }, token);
    } catch (mockErr) {
      throw new Error(mockErr?.message || 'تعذر الاتصال بالخادم');
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // إذا كان الخطأ 404 أو الاستجابة ليست JSON (مثلاً صفحة HTML عند الاستضافة الساكنة على Vercel بدون backend)،
    // نلجأ فوراً لبيانات المحاكاة لضمان عمل الموقع بالكامل بسلاسة
    if (payload === null || response.status === 404 || response.status === 502 || response.status === 503) {
      try {
        return await mockRequest(path, { method, body, query }, token);
      } catch {
        // نكمل لمعالجة الخطأ
      }
    }

    if (response.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event('nasaq:unauthorized'));
    }

    const details = payload?.details?.map((d) => d.message).filter(Boolean).join(' · ');
    throw new Error(details || payload?.message || 'حدث خطأ غير متوقع، حاول مرة أخرى');
  }

  return payload;
}
