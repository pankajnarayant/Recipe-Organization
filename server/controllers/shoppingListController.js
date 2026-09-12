import ShoppingListItem from '../models/ShoppingListItem.js';
import MealPlan from '../models/MealPlan.js';
import {
  aggregateIngredients,
  normalizeIngredientName,
  normalizeUnit,
  formatDisplayName,
} from '../services/aggregatorService.js';

// @desc    Get user's shopping list
// @route   GET /api/shopping-list
// @access  Private
export const getShoppingList = async (req, res, next) => {
  try {
    const items = await ShoppingListItem.find({ user: req.user._id }).sort({
      purchased: 1,
      createdAt: -1,
    });

    const totalCount = items.length;
    const purchasedCount = items.filter((item) => item.purchased).length;
    const pendingCount = totalCount - purchasedCount;

    res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        purchased: purchasedCount,
        pending: pendingCount,
      },
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate shopping list from weekly meal plan
// @route   POST /api/shopping-list/generate
// @access  Private
export const generateShoppingList = async (req, res, next) => {
  try {
    const { weekStartDate, keepManual = true } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide weekStartDate to generate shopping list from',
      });
    }

    const mealPlan = await MealPlan.findOne({
      user: req.user._id,
      weekStartDate,
    }).populate('meals.recipe');

    if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No meals found for the selected week. Add recipes to your meal plan first!',
      });
    }

    // Aggregate and scale ingredients based on planned servings vs recipe servings
    const consolidated = aggregateIngredients(mealPlan.meals);

    if (consolidated.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Planned recipes do not contain any ingredients to generate list from',
      });
    }

    // Duplicate Prevention Strategy:
    // Remove previously generated items for this week (or all generated items if not week-bound)
    // while keeping manual items safely intact.
    await ShoppingListItem.deleteMany({
      user: req.user._id,
      source: 'generated',
      ...(weekStartDate ? { weekStartDate } : {}),
    });

    // Also check if any existing manual items match the newly generated items and optionally merge
    const itemsToInsert = consolidated.map((item) => ({
      user: req.user._id,
      weekStartDate,
      name: item.name,
      normalizedName: item.normalizedName,
      quantity: item.quantity,
      unit: item.unit,
      purchased: false,
      source: 'generated',
    }));

    await ShoppingListItem.insertMany(itemsToInsert);

    // Fetch full shopping list for the user
    const updatedList = await ShoppingListItem.find({ user: req.user._id }).sort({
      purchased: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: `Generated ${itemsToInsert.length} consolidated grocery items for week of ${weekStartDate}`,
      data: updatedList,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a manual shopping list item
// @route   POST /api/shopping-list
// @access  Private
export const addManualItem = async (req, res, next) => {
  try {
    const { name, quantity, unit } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    if (!unit || !unit.trim()) {
      return res.status(400).json({ success: false, message: 'Unit is required' });
    }

    const normalizedName = normalizeIngredientName(name);
    const normalizedUnit = normalizeUnit(unit);

    // Check if an existing unpurchased item with same name & unit exists, if so combine quantity
    const existing = await ShoppingListItem.findOne({
      user: req.user._id,
      normalizedName,
      unit: normalizedUnit,
      purchased: false,
    });

    let item;
    if (existing) {
      existing.quantity = Math.round((existing.quantity + numQty) * 100) / 100;
      item = await existing.save();
    } else {
      item = await ShoppingListItem.create({
        user: req.user._id,
        name: formatDisplayName(normalizedName) || name.trim(),
        normalizedName,
        quantity: Math.round(numQty * 100) / 100,
        unit: normalizedUnit,
        purchased: false,
        source: 'manual',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Item added to shopping list',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a shopping list item
// @route   PUT /api/shopping-list/:id
// @access  Private
export const updateItem = async (req, res, next) => {
  try {
    const item = await ShoppingListItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this item' });
    }

    const { name, quantity, unit, purchased } = req.body;

    if (name) {
      item.name = name.trim();
      item.normalizedName = normalizeIngredientName(name);
    }
    if (quantity !== undefined) {
      const numQty = Number(quantity);
      if (numQty > 0) item.quantity = Math.round(numQty * 100) / 100;
    }
    if (unit) {
      item.unit = normalizeUnit(unit);
    }
    if (purchased !== undefined) {
      item.purchased = Boolean(purchased);
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle purchased status
// @route   PUT /api/shopping-list/:id/toggle
// @access  Private
export const togglePurchased = async (req, res, next) => {
  try {
    const item = await ShoppingListItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this item' });
    }

    item.purchased = !item.purchased;
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a shopping list item
// @route   DELETE /api/shopping-list/:id
// @access  Private
export const deleteItem = async (req, res, next) => {
  try {
    const item = await ShoppingListItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item removed from shopping list',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear all purchased items
// @route   DELETE /api/shopping-list/purchased
// @access  Private
export const clearPurchased = async (req, res, next) => {
  try {
    const result = await ShoppingListItem.deleteMany({
      user: req.user._id,
      purchased: true,
    });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} purchased items`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire shopping list
// @route   DELETE /api/shopping-list/all
// @access  Private
export const clearAll = async (req, res, next) => {
  try {
    const result = await ShoppingListItem.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: `Cleared all ${result.deletedCount} items from shopping list`,
    });
  } catch (err) {
    next(err);
  }
};
