import express from 'express';
import {
  getShoppingList,
  generateShoppingList,
  addManualItem,
  updateItem,
  togglePurchased,
  deleteItem,
  clearPurchased,
  clearAll,
} from '../controllers/shoppingListController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All shopping list routes require authentication

router.get('/', getShoppingList);
router.post('/generate', generateShoppingList);
router.post('/', addManualItem);
router.delete('/purchased', clearPurchased);
router.delete('/all', clearAll);

router.put('/:id', updateItem);
router.put('/:id/toggle', togglePurchased);
router.delete('/:id', deleteItem);

export default router;
