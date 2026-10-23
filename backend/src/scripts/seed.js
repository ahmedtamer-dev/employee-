import { db } from '../lib/db.js';
import { env } from '../config/env.js';

const data = db.reset();

console.log(`تم توليد بيانات تجريبية جديدة في: ${env.dbFile}`);
console.log(
  `الموظفون: ${data.employees.length} | المسيّرات: ${data.payrollRuns.length} | المرشحون: ${data.candidates.length}`,
);
console.log('حسابات الدخول: ahmed@nasaq.co / mona@nasaq.co / khaled@nasaq.co - كلمة المرور: 123456');
