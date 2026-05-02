import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  adminLogin, adminLogout, changePassword,
  getMe, getStats, getAdminProducts, getAdminProductById,
  getAllAdminReviews, getLowInventoryProducts, getTopSellingProducts,
  getNotificationCounts, getRevenueChart,
} from '../controllers/adminController';
import { adminCreateReview } from '../controllers/reviewController';
import { getAllSlides, createSlide, updateSlide, deleteSlide } from '../controllers/heroSlideController';
import { updateConfig } from '../controllers/siteConfigController';
import { getPromoPanel, updatePromoPanel } from '../controllers/promoPanelController';
import { getStaticPage, updateStaticPage } from '../controllers/staticPageController';
import { protect } from '../middleware/auth';

// Stricter rate limiter only for login: 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

const router = Router();

router.post('/login', loginLimiter, adminLogin);
router.post('/logout', protect, adminLogout);
router.get('/me', protect, getMe);
router.patch('/me/password', protect, changePassword);
router.get('/stats', protect, getStats);
router.get('/revenue-chart', protect, getRevenueChart);
router.get('/low-inventory', protect, getLowInventoryProducts);
router.get('/top-selling', protect, getTopSellingProducts);
router.get('/notifications', protect, getNotificationCounts);

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

// Static pages (privacy-policy, about, terms)
router.get('/pages/:slug', protect, getStaticPage);
router.put('/pages/:slug', protect, updateStaticPage);

export default router;
