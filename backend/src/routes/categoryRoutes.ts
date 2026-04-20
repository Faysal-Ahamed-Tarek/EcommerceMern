import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, validate(createCategorySchema), createCategory);
router.put('/:id', protect, validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
