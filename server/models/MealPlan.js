import mongoose from 'mongoose';

const plannedMealSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Date is required'],
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Day of week is required'],
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: [true, 'Meal type is required'],
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe reference is required'],
    },
    servings: {
      type: Number,
      required: [true, 'Servings count is required'],
      min: [1, 'Servings must be at least 1'],
      default: 2,
    },
  },
  { _id: true }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStartDate: {
      type: String, // Formatted as YYYY-MM-DD (e.g. Monday's date)
      required: [true, 'Week start date is required'],
    },
    meals: {
      type: [plannedMealSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one meal plan per user per week
mealPlanSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

const MongooseMealPlan = mongoose.model('MealPlan', mealPlanSchema);
import { createModelFacade } from '../config/fallbackStore.js';
const MealPlan = createModelFacade('mealplans', MongooseMealPlan);
export default MealPlan;

