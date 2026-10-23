import { ApiError } from '../utils/index.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `المسار غير موجود: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (error?.name === 'ZodError') {
    return res.status(422).json({
      message: 'بيانات الطلب غير صحيحة',
      details: error.issues?.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  console.error('[api] خطأ غير متوقع:', error);
  return res.status(500).json({
    message: 'حدث خطأ غير متوقع في الخادم',
  });
};
