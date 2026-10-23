import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { env, isProduction } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import apiRoutes from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin: isProduction ? env.corsOrigin : true,
      credentials: false,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (!isProduction) {
    app.use(morgan('dev'));
  }

  app.get('/', (req, res) => {
    res.json({
      name: 'نسق | نظام إدارة الموظفين - API',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  app.use('/api', apiRoutes);
  app.use('/', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
