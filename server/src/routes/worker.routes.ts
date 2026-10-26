import { Router } from 'express';
import { workerController } from '../controllers/worker.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleGuard';

const router = Router();

// Public routes
router.get('/', (req, res, next) => workerController.searchWorkers(req, res, next));
router.get('/:id/public', (req, res, next) =>
  workerController.getWorkerPublicProfile(req, res, next)
);

// Worker-only protected routes
router.get('/profile/me', authenticate, requireRoles('WORKER'), (req, res, next) =>
  workerController.getMyProfile(req, res, next)
);

router.put('/profile', authenticate, requireRoles('WORKER'), (req, res, next) =>
  workerController.updateProfile(req, res, next)
);

router.patch('/availability', authenticate, requireRoles('WORKER'), (req, res, next) =>
  workerController.updateAvailability(req, res, next)
);

export default router;
