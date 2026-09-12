import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Ingredient quantity is required'],
      min: [0.01, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      required: [true, 'Ingredient unit is required'],
      trim: true,
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Custom'],
      default: 'Dinner',
    },
    tags: {
      type: [String],
      default: [],
    },
    prepTime: {
      type: Number,
      default: 15,
      min: [0, 'Prep time cannot be negative'],
    },
    cookTime: {
      type: Number,
      default: 20,
      min: [0, 'Cook time cannot be negative'],
    },
    servings: {
      type: Number,
      required: [true, 'Servings count is required'],
      min: [1, 'Servings must be at least 1'],
      default: 2,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A recipe must contain at least one ingredient',
      },
    },
    instructions: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0 && v.every((step) => step && step.trim().length > 0);
        },
        message: 'A recipe must contain at least one instruction step',
      },
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search and filter indexes
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ owner: 1 });
recipeSchema.index({ createdAt: -1 });

const MongooseRecipe = mongoose.model('Recipe', recipeSchema);
import { createModelFacade } from '../config/fallbackStore.js';
const Recipe = createModelFacade('recipes', MongooseRecipe);
export default Recipe;

