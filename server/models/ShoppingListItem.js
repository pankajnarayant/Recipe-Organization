import mongoose from 'mongoose';

const shoppingListItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStartDate: {
      type: String, // Optional reference to the week it was generated from
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    normalizedName: {
      type: String,
      required: [true, 'Normalized name is required'],
      trim: true,
      lowercase: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['generated', 'manual'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

shoppingListItemSchema.index({ user: 1, purchased: 1 });
shoppingListItemSchema.index({ user: 1, weekStartDate: 1 });

const MongooseShoppingListItem = mongoose.model('ShoppingListItem', shoppingListItemSchema);
import { createModelFacade } from '../config/fallbackStore.js';
const ShoppingListItem = createModelFacade('shoppinglistitems', MongooseShoppingListItem);
export default ShoppingListItem;

