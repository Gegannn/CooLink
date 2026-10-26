import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleGuard';

const router = Router();

router.use(authenticate, requireRoles('ADMIN'));

router.get('/analytics', (req, res, next) =>
  adminController.getAnalytics(req, res, next)
);

router.get('/users', (req, res, next) =>
  adminController.getUsers(req, res, next)
);

router.patch('/users/:id/status', (req, res, next) =>
  adminController.updateUserStatus(req, res, next)
);

export default router;
