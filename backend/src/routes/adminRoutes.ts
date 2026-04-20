import { Router } from 'express';
import { adminLogin, getMe, getStats, getAdminProducts, getAllAdminReviews } from '../controllers/adminController';
import { getAllSlides, createSlide, updateSlide, deleteSlide } from '../controllers/heroSlideController';
import { updateConfig } from '../controllers/siteConfigController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/login', adminLogin);
router.get('/me', protect, getMe);
router.get('/stats', protect, getStats);

// Products (all statuses)
router.get('/products', protect, getAdminProducts);

// Reviews (all statuses)
router.get('/reviews', protect, getAllAdminReviews);

// Site config
router.put('/config', protect, updateConfig);

// Hero slides CRUD
router.get('/slides', protect, getAllSlides);
router.post('/slides', protect, createSlide);
router.put('/slides/:id', protect, updateSlide);
router.delete('/slides/:id', protect, deleteSlide);

export default router;
