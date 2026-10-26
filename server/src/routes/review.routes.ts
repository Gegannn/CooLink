import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, (req, res, next) =>
  reviewController.submitReview(req, res, next)
);

router.get('/user/:userId', (req, res, next) =>
  reviewController.getReviewsForUser(req, res, next)
);

export default router;
