import { Router } from 'express';
import { adminLogin, getMe } from '../controllers/adminController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/login', adminLogin);
router.get('/me', protect, getMe);

export default router;
