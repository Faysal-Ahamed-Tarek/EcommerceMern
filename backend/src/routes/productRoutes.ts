import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCarouselSections,
} from '../controllers/productController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../schemas/productSchema';

const router = Router();

router.get('/', getProducts);
router.get('/carousel', getCarouselSections); // must be before /:slug
router.get('/:slug', getProductBySlug);
router.post('/', protect, validate(createProductSchema), createProduct);
router.put('/:id', protect, validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
