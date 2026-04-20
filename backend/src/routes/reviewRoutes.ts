import { Router } from 'express';
import {
  createReview,
  getApprovedReviews,
  getPendingReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../schemas/reviewSchema';

const router = Router();

router.post('/', validate(createReviewSchema), createReview);
router.get('/product/:slug', getApprovedReviews);
router.get('/pending', protect, getPendingReviews);
router.patch('/:id/status', protect, updateReviewStatus);
router.delete('/:id', protect, deleteReview);

export default router;
