import { Router } from 'express';
import { workRequestController } from '../controllers/workRequest.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleGuard';

const router = Router();

router.post('/', authenticate, requireRoles('EMPLOYER', 'ADMIN'), (req, res, next) =>
  workRequestController.createWorkRequest(req, res, next)
);

router.get('/worker', authenticate, requireRoles('WORKER'), (req, res, next) =>
  workRequestController.getWorkerRequests(req, res, next)
);

router.get('/employer', authenticate, requireRoles('EMPLOYER', 'ADMIN'), (req, res, next) =>
  workRequestController.getEmployerRequests(req, res, next)
);

router.patch('/:id/accept', authenticate, requireRoles('WORKER'), (req, res, next) =>
  workRequestController.acceptWorkRequest(req, res, next)
);

router.patch('/:id/reject', authenticate, requireRoles('WORKER'), (req, res, next) =>
  workRequestController.rejectWorkRequest(req, res, next)
);

export default router;
