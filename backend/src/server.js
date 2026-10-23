import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`\n  نسق API يعمل على http://localhost:${env.port}/api`);
  console.log(`  البيئة: ${env.nodeEnv}\n`);
});

const shutdown = (signal) => {
  console.log(`\n[api] إيقاف الخادم (${signal})...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
