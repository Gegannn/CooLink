import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleGuard';

const router = Router();

// User safety actions
router.post('/', authenticate, (req, res, next) =>
  reportController.submitReport(req, res, next)
);

router.post('/block', authenticate, (req, res, next) =>
  reportController.blockUser(req, res, next)
);

// Admin moderation actions
router.get('/', authenticate, requireRoles('ADMIN'), (req, res, next) =>
  reportController.getReports(req, res, next)
);

router.patch('/:id/resolve', authenticate, requireRoles('ADMIN'), (req, res, next) =>
  reportController.resolveReport(req, res, next)
);

router.get('/signals/:userId', authenticate, requireRoles('ADMIN'), (req, res, next) =>
  reportController.getSuspiciousSignals(req, res, next)
);

export default router;
