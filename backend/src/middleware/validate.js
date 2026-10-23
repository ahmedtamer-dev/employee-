import { ApiError } from '../utils/index.js';

/**
 * يتحقق من جسم الطلب باستخدام مخطط Zod.
 * validate(schema, 'query' | 'params' | 'body')
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return next(
      new ApiError(
        422,
        'بيانات الطلب غير صحيحة',
        result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      ),
    );
  }

  req[source] = result.data;
  return next();
};
