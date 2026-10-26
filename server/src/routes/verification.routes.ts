import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleGuard';

const router = Router();

// User submits their own verification
router.post('/submit', authenticate, (req, res, next) =>
  verificationController.submitVerification(req, res, next)
);

// Admin review endpoints
router.get('/pending', authenticate, requireRoles('ADMIN'), (req, res, next) =>
  verificationController.getPendingVerifications(req, res, next)
);

router.patch('/:id/review', authenticate, requireRoles('ADMIN'), (req, res, next) =>
  verificationController.reviewVerification(req, res, next)
);

export default router;
