import { Router } from 'express';
import { adminLogin, getMe, getStats, getAdminProducts, getAdminProductById, getAllAdminReviews, getLowInventoryProducts, getTopSellingProducts } from '../controllers/adminController';
import { adminCreateReview } from '../controllers/reviewController';
import { getAllSlides, createSlide, updateSlide, deleteSlide } from '../controllers/heroSlideController';
import { updateConfig } from '../controllers/siteConfigController';
import { getPromoPanel, updatePromoPanel } from '../controllers/promoPanelController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/login', adminLogin);
router.get('/me', protect, getMe);
router.get('/stats', protect, getStats);
router.get('/low-inventory', protect, getLowInventoryProducts);
router.get('/top-selling', protect, getTopSellingProducts);

// Products (all statuses)
router.get('/products', protect, getAdminProducts);
router.get('/products/:id', protect, getAdminProductById);

// Reviews (all statuses)
router.get('/reviews', protect, getAllAdminReviews);
router.post('/reviews', protect, adminCreateReview);

// Site config
router.put('/config', protect, updateConfig);

// Hero slides CRUD
router.get('/slides', protect, getAllSlides);
router.post('/slides', protect, createSlide);
router.put('/slides/:id', protect, updateSlide);
router.delete('/slides/:id', protect, deleteSlide);

// Promo panel (two banner images)
router.get('/promo-panel', protect, getPromoPanel);
router.put('/promo-panel', protect, updatePromoPanel);

export default router;
