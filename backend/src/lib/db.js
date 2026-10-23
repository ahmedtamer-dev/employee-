import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { env } from '../config/env.js';
import { buildSeed } from '../data/seed.js';

/**
 * طبقة تخزين بسيطة تعتمد على ملف JSON.
 * الهدف: تشغيل المشروع بدون أي خدمة خارجية، مع نقطة واحدة
 * لتغيير التخزين إلى قاعدة بيانات حقيقية لاحقًا.
 */
class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
        return;
      }
    } catch (error) {
      console.error('[db] تعذر قراءة ملف البيانات، سيتم إعادة توليده:', error.message);
    }

    this.data = buildSeed();
    this.persist();
  }

  persist() {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[db] تعذر كتابة البيانات على القرص (بيئة قراءة فقط):', err.message);
    }
  }

  /** حفظ التغييرات على القرص */
  save() {
    this.persist();
    return this.data;
  }

  /** إعادة تعيين البيانات إلى النسخة الأولية */
  reset() {
    this.data = buildSeed();
    return this.save();
  }

  generateId(prefix = 'id') {
    return `${prefix}_${randomUUID().slice(0, 8)}`;
  }

  /**
   * بحث سريع داخل مجموعة مع دعم البحث النصي/الفلاتر.
   */
  find(collection, predicate = () => true) {
    return (this.data[collection] || []).filter(predicate);
  }

  findOne(collection, predicate) {
    return (this.data[collection] || []).find(predicate) || null;
  }

  insert(collection, record, prefix = 'id') {
    const row = {
      id: record.id || this.generateId(prefix),
      createdAt: record.createdAt || new Date().toISOString(),
      ...record,
    };
    this.data[collection] = [...(this.data[collection] || []), row];
    this.save();
    return row;
  }

  update(collection, id, patch) {
    let updated = null;
    this.data[collection] = (this.data[collection] || []).map((row) => {
      if (row.id !== id) return row;
      updated = { ...row, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) this.save();
    return updated;
  }

  remove(collection, id) {
    const before = (this.data[collection] || []).length;
    this.data[collection] = (this.data[collection] || []).filter((row) => row.id !== id);
    if (this.data[collection].length !== before) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new JsonDatabase(env.dbFile);
