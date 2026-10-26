import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleGuard';

const router = Router();

// Public / Authenticated discovery
router.get('/', (req, res, next) => jobController.getJobs(req, res, next));
router.get('/:id', (req, res, next) => jobController.getJobById(req, res, next));

// Employer actions
router.post('/', authenticate, requireRoles('EMPLOYER', 'ADMIN'), (req, res, next) =>
  jobController.createJob(req, res, next)
);

router.patch('/:id/status', authenticate, requireRoles('EMPLOYER', 'ADMIN'), (req, res, next) =>
  jobController.updateJobStatus(req, res, next)
);

export default router;
