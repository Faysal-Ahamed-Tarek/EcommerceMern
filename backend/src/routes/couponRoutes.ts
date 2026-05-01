import { Router } from 'express';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCouponSchema, updateCouponSchema, applyCouponSchema } from '../schemas/couponSchema';

const router = Router();

router.get('/', protect, getAllCoupons);
router.post('/', protect, validate(createCouponSchema), createCoupon);
router.put('/:id', protect, validate(updateCouponSchema), updateCoupon);
router.delete('/:id', protect, deleteCoupon);
router.post('/validate', validate(applyCouponSchema), validateCoupon);

export default router;
