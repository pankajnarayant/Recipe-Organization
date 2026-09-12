import Recipe from '../models/Recipe.js';
import User from '../models/User.js';

// @desc    Get recipes with search, filtering, sorting, and pagination
// @route   GET /api/recipes
// @access  Public / Optional Auth
export const getRecipes = async (req, res, next) => {
  try {
    const {
      search,
      category,
      tag,
      difficulty,
      maxCookTime,
      sort,
      myRecipes,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Only fetch public recipes OR user's own recipes
    if (myRecipes === 'true' && req.user) {
      query.owner = req.user._id;
    } else {
      // Default to public recipes or recipes owned by current user
      if (req.user) {
        query.$or = [{ isPublic: true }, { owner: req.user._id }];
      } else {
        query.isPublic = true;
      }
    }

    // Search keyword in title, description, or tags
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
        ],
      });
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Tag filter
    if (tag && tag !== 'All') {
      query.tags = { $in: [tag] };
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Max cooking time filter
    if (maxCookTime) {
      const maxTime = Number(maxCookTime);
      if (!isNaN(maxTime) && maxTime > 0) {
        query.cookTime = { $lte: maxTime };
      }
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // Default newest
    if (sort === 'cookTime') {
      sortOptions = { cookTime: 1 };
    } else if (sort === 'alphabetical') {
      sortOptions = { title: 1 };
    } else if (sort === 'difficulty') {
      sortOptions = { difficulty: 1 };
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .populate('owner', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      hasNextPage: pageNumber * limitNumber < total,
      hasPrevPage: pageNumber > 1,
      data: recipes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public / Optional Auth
export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('owner', 'name email');

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
export const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      image,
      category,
      tags,
      prepTime,
      cookTime,
      servings,
      difficulty,
      ingredients,
      instructions,
      nutrition,
      isPublic,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category',
      });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A recipe must contain at least one ingredient',
      });
    }

    for (const ing of ingredients) {
      if (!ing.name || !ing.name.trim()) {
        return res.status(400).json({ success: false, message: 'Every ingredient must have a name' });
      }
      if (typeof ing.quantity !== 'number' || ing.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Ingredient quantity must be a positive number' });
      }
      if (!ing.unit || !ing.unit.trim()) {
        return res.status(400).json({ success: false, message: 'Every ingredient must have a unit' });
      }
    }

    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A recipe must contain at least one instruction step',
      });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      description: description.trim(),
      image: image || undefined,
      category,
      tags: Array.isArray(tags) ? tags : [],
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 20,
      servings: Number(servings) || 2,
      difficulty: difficulty || 'Easy',
      ingredients: ingredients.map((ing) => ({
        name: ing.name.trim(),
        quantity: Number(ing.quantity),
        unit: ing.unit.trim(),
      })),
      instructions: instructions.map((step) => step.trim()).filter(Boolean),
      nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      isPublic: isPublic !== undefined ? isPublic : true,
      owner: req.user._id,
    });

    const populated = await Recipe.findById(recipe._id).populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private (Owner only)
export const updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Ownership check
    const recipeOwnerId = (recipe.owner?._id || recipe.owner)?.toString();
    const currentUserId = (req.user?._id || req.user)?.toString();
    if (recipeOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this recipe',
      });
    }


    const updateData = { ...req.body };
    delete updateData.owner; // prevent re-assigning owner

    // If ingredients provided, validate them
    if (updateData.ingredients) {
      if (!Array.isArray(updateData.ingredients) || updateData.ingredients.length === 0) {
        return res.status(400).json({ success: false, message: 'Recipe must have at least one ingredient' });
      }
      for (const ing of updateData.ingredients) {
        if (!ing.name || !ing.unit || typeof ing.quantity !== 'number' || ing.quantity <= 0) {
          return res.status(400).json({ success: false, message: 'Invalid ingredient format' });
        }
      }
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email');

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private (Owner only)
export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Ownership check
    const recipeOwnerId = (recipe.owner?._id || recipe.owner)?.toString();
    const currentUserId = (req.user?._id || req.user)?.toString();
    if (recipeOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this recipe',
      });
    }


    await recipe.deleteOne();

    // Also remove recipe from any user's favorites
    await User.updateMany(
      { favorites: req.params.id },
      { $pull: { favorites: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle favorite status for a recipe
// @route   POST /api/recipes/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    const isFav = user.favorites.some((id) => id.toString() === recipeId);

    if (isFav) {
      user.favorites = user.favorites.filter((id) => id.toString() !== recipeId);
    } else {
      user.favorites.push(recipeId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isFavorite: !isFav,
      favoritesCount: user.favorites.length,
      message: !isFav ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's favorite recipes
// @route   GET /api/recipes/favorites
// @access  Private
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'owner', select: 'name email' },
    });

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites,
    });
  } catch (err) {
    next(err);
  }
};
