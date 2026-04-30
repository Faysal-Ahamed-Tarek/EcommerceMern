import { Router } from 'express';
import {
  getActiveHomeReviews,
  getAllHomeReviews,
  createHomeReview,
  updateHomeReview,
  deleteHomeReview,
} from '../controllers/homeReviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getActiveHomeReviews);
router.get('/all', protect, getAllHomeReviews);
router.post('/', protect, createHomeReview);
router.put('/:id', protect, updateHomeReview);
router.delete('/:id', protect, deleteHomeReview);

export default router;
