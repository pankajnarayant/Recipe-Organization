import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';

// @desc    Get meal plan for a specific week
// @route   GET /api/meal-plans/:weekStartDate
// @access  Private
export const getMealPlanByWeek = async (req, res, next) => {
  try {
    const { weekStartDate } = req.params;

    let mealPlan = await MealPlan.findOne({
      user: req.user._id,
      weekStartDate,
    }).populate({
      path: 'meals.recipe',
      select: 'title description image category prepTime cookTime servings difficulty ingredients',
    });

    if (!mealPlan) {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user._id,
          weekStartDate,
          meals: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: mealPlan,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add or update a meal slot in a week's plan
// @route   POST /api/meal-plans
// @access  Private
export const addOrUpdateMeal = async (req, res, next) => {
  try {
    const { weekStartDate, date, dayOfWeek, mealType, recipeId, servings } = req.body;

    if (!weekStartDate || !date || !dayOfWeek || !mealType || !recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide weekStartDate, date, dayOfWeek, mealType, and recipeId',
      });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    let mealPlan = await MealPlan.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!mealPlan) {
      mealPlan = new MealPlan({
        user: req.user._id,
        weekStartDate,
        meals: [],
      });
    }

    const plannedServings = Number(servings) > 0 ? Number(servings) : recipe.servings || 2;

    // Check if slot already exists for the same date and mealType
    const existingIndex = mealPlan.meals.findIndex(
      (m) => m.date === date && m.mealType === mealType
    );

    if (existingIndex > -1) {
      // Replace existing meal slot
      mealPlan.meals[existingIndex].recipe = recipe._id;
      mealPlan.meals[existingIndex].servings = plannedServings;
      mealPlan.meals[existingIndex].dayOfWeek = dayOfWeek;
    } else {
      // Push new meal slot with unique _id
      const slotId = Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
      mealPlan.meals.push({
        _id: slotId,
        date,
        dayOfWeek,
        mealType,
        recipe: recipe._id,
        servings: plannedServings,
      });
    }


    await mealPlan.save();

    const populated = await MealPlan.findById(mealPlan._id).populate({
      path: 'meals.recipe',
      select: 'title description image category prepTime cookTime servings difficulty ingredients',
    });

    res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove a meal slot from the meal plan
// @route   DELETE /api/meal-plans/slot/:slotId
// @access  Private
export const removeMealSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const mealPlan = await MealPlan.findOne({
      user: req.user._id,
      'meals._id': slotId,
    });

    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Meal slot not found in your meal plans' });
    }

    mealPlan.meals = mealPlan.meals.filter((m) => m._id.toString() !== slotId);
    await mealPlan.save();

    const populated = await MealPlan.findById(mealPlan._id).populate({
      path: 'meals.recipe',
      select: 'title description image category prepTime cookTime servings difficulty ingredients',
    });

    res.status(200).json({
      success: true,
      message: 'Meal removed from plan',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire weekly meal plan
// @route   DELETE /api/meal-plans/week/:weekStartDate
// @access  Private
export const clearWeekPlan = async (req, res, next) => {
  try {
    const { weekStartDate } = req.params;

    const mealPlan = await MealPlan.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (mealPlan) {
      mealPlan.meals = [];
      await mealPlan.save();
    }

    res.status(200).json({
      success: true,
      message: 'Weekly meal plan cleared',
      data: mealPlan || { user: req.user._id, weekStartDate, meals: [] },
    });
  } catch (err) {
    next(err);
  }
};
