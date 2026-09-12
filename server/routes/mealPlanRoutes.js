import express from 'express';
import {
  getMealPlanByWeek,
  addOrUpdateMeal,
  removeMealSlot,
  clearWeekPlan,
} from '../controllers/mealPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All meal plan routes require user authentication

router.get('/:weekStartDate', getMealPlanByWeek);
router.post('/', addOrUpdateMeal);
router.delete('/slot/:slotId', removeMealSlot);
router.delete('/week/:weekStartDate', clearWeekPlan);

export default router;
