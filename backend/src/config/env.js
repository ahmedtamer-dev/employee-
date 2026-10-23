import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, '../..');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'nasaq-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : true,
  dbFile: process.env.DB_FILE
    ? path.resolve(backendRoot, process.env.DB_FILE)
    : (process.env.VERCEL ? path.join('/tmp', 'db.json') : path.join(backendRoot, 'data', 'db.json')),
};

export const isProduction = env.nodeEnv === 'production';
