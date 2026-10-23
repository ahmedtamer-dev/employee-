import { Router } from 'express';
import { z } from 'zod';

import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const router = Router();

router.use(requireAuth);

const STAGES = ['متقدمون', 'فرز أولي', 'مقابلات', 'عرض وظيفي', 'تم التعيين'];

const buildBoard = () => {
  const candidates = db.data.candidates;

  return {
    stages: STAGES,
    columns: STAGES.map((title, stage) => {
      const items = candidates
        .filter((candidate) => candidate.stage === stage)
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          title: candidate.title,
          initials: candidate.name.charAt(0),
          stage: candidate.stage,
          canMove: stage < STAGES.length - 1,
        }));

      return { stage, title, count: items.length, items };
    }),
    total: candidates.length,
  };
};

router.get('/board', requireRole('hr'), (req, res) => {
  res.json(buildBoard());
});

router.get('/stages', requireRole('hr'), (req, res) => {
  res.json({ stages: STAGES });
});

router.post(
  '/candidates',
  requireRole('hr'),
  validate(
    z.object({
      name: z.string().trim().min(2, 'اسم المرشح مطلوب'),
      title: z.string().trim().min(2, 'الوظيفة مطلوبة'),
    }),
  ),
  asyncHandler(async (req, res) => {
    const candidate = db.insert(
      'candidates',
      {
        name: req.body.name,
        title: req.body.title,
        stage: 0,
        email: '',
        phone: '',
        appliedAt: new Date().toISOString().slice(0, 10),
      },
      'cand',
    );

    res.status(201).json({ candidate, board: buildBoard(), message: 'تمت إضافة المرشح' });
  }),
);

router.patch(
  '/candidates/:id/stage',
  requireRole('hr'),
  validate(z.object({ stage: z.coerce.number().int().min(0).max(4) })),
  asyncHandler(async (req, res) => {
    const candidate = db.findOne('candidates', (row) => row.id === req.params.id);
    if (!candidate) throw new ApiError(404, 'المرشح غير موجود');

    db.update('candidates', candidate.id, { stage: req.body.stage });

    res.json({
      board: buildBoard(),
      message: `تم نقل المرشح إلى مرحلة «${STAGES[req.body.stage]}»`,
    });
  }),
);

router.delete(
  '/candidates/:id',
  requireRole('hr'),
  asyncHandler(async (req, res) => {
    const candidate = db.findOne('candidates', (row) => row.id === req.params.id);
    if (!candidate) throw new ApiError(404, 'المرشح غير موجود');

    db.remove('candidates', candidate.id);
    res.json({ board: buildBoard(), message: 'تم حذف المرشح' });
  }),
);

export default router;
