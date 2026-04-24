import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '../schemas/orderSchema';

const router = Router();

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', protect, getOrders);
router.get('/confirmation/:orderId', getOrderByOrderId);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id', protect, updateOrder);
router.delete('/:id', protect, deleteOrder);

export default router;
