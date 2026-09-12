import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getFavorites,
} from '../controllers/recipeController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getRecipes);
router.get('/favorites', protect, getFavorites);
router.get('/:id', optionalAuth, getRecipeById);

router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

router.post('/:id/favorite', protect, toggleFavorite);

export default router;
