# نسق | نظام إدارة الموظفين

مشروع HR متكامل مقسّم إلى **Frontend (React + Vite)** و **Backend (Node.js + Express)**.

## الهيكل

```
.
├── frontend/          # React + Vite (RTL - عربي)
│   └── src/
│       ├── api/       # طبقة الاتصال بالـ API
│       ├── components/# مكونات الواجهة المشتركة
│       ├── context/   # المصادقة والحالة العامة
│       ├── hooks/     # Hooks مساعدة
│       ├── layouts/   # إطار التطبيق (Topbar + Tabs)
│       ├── pages/     # شاشات الموظف / HR / الإدارة
│       └── styles/    # نظام التصميم (CSS)
├── backend/           # Node.js + Express REST API
│   ├── data/          # ملف قاعدة البيانات (JSON) - يُنشأ تلقائيًا
│   └── src/
│       ├── config/    # الإعدادات و env
│       ├── data/      # البيانات الأولية (Seed)
│       ├── lib/       # تخزين JSON + تشفير كلمات المرور
│       ├── middleware/# المصادقة / التحقق / الأخطاء
│       ├── routes/    # مسارات REST
│       ├── services/  # منطق الأعمال (رواتب، مؤشرات، لوحات)
│       └── utils/
└── package.json       # npm workspaces + تشغيل المشروعين معًا
```

## التشغيل

```bash
npm install          # تثبيت اعتماديات المشروعين
npm run dev          # تشغيل API (4000) + الواجهة (5173)
```

- الواجهة: http://localhost:5173
- الـ API: http://localhost:4000/api
- فحص الصحة: http://localhost:4000/api/health

### بيانات الدخول التجريبية

| الحساب | البريد | كلمة المرور | الدور |
| --- | --- | --- | --- |
| أحمد سمير | ahmed@nasaq.co | 123456 | موظف |
| منى عادل | mona@nasaq.co | 123456 | موارد بشرية |
| خالد منصور | khaled@nasaq.co | 123456 | الإدارة |

> في صفحة الدخول أزرار "دخول سريع" لكل حساب.

## أوامر مفيدة

```bash
npm run dev:backend     # تشغيل الـ API فقط
npm run dev:frontend    # تشغيل الواجهة فقط
npm run seed            # إعادة توليد البيانات التجريبية
npm run build           # بناء الواجهة للإنتاج
npm start               # تشغيل الـ API للإنتاج
```

## ملاحظات

- التخزين يعتمد على ملف JSON (`backend/data/db.json`) لسهولة التشغيل بدون تثبيت قاعدة بيانات، والطبقة معزولة في `backend/src/lib/db.js` لتسهيل استبدالها بـ PostgreSQL/Prisma لاحقًا.
- المصادقة عبر JWT، وكلمات المرور مشفّرة بـ `scrypt`.
- الصلاحيات على مستوى الراوت: `emp` / `hr` / `mgmt`.
- نسخ `.env.example` إلى `.env` لتغيير المنفذ أو سر الـ JWT.
