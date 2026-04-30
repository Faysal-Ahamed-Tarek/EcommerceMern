import { Router } from 'express';
import { getSEO, createOrUpdateSEO } from '../controllers/seoController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateSEOSchema } from '../schemas/seoSchema';

const router = Router();

router.get('/:page', getSEO);
router.put('/:page', protect, validate(updateSEOSchema), createOrUpdateSEO);

export default router;
