import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import MealPlan from '../models/MealPlan.js';
import ShoppingListItem from '../models/ShoppingListItem.js';
import { sampleRecipes } from './seedData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing recipes and demo user data...');
    // We clean up recipes and sample user
    await Recipe.deleteMany({});
    await MealPlan.deleteMany({});
    await ShoppingListItem.deleteMany({});
    await User.deleteMany({ email: 'chef@smartplate.com' });

    console.log('[Seed] Creating demo chef user...');
    const demoUser = await User.create({
      name: 'Chef Alex',
      email: 'chef@smartplate.com',
      password: 'password123',
    });

    console.log(`[Seed] Demo user created with id: ${demoUser._id}`);

    console.log('[Seed] Inserting 15 curated recipes...');
    const recipesWithOwner = sampleRecipes.map((recipe) => ({
      ...recipe,
      owner: demoUser._id,
      isPublic: true,
    }));

    const createdRecipes = await Recipe.insertMany(recipesWithOwner);
    console.log(`[Seed] Successfully inserted ${createdRecipes.length} recipes!`);

    // Add 2 favorite recipes to demo user
    demoUser.favorites = [createdRecipes[0]._id, createdRecipes[3]._id, createdRecipes[6]._id];
    await demoUser.save();
    console.log('[Seed] Added sample favorites to demo user.');

    console.log('\n=========================================');
    console.log(' SEED COMPLETED SUCCESSFULLY!');
    console.log(' Demo credentials:');
    console.log('   Email: chef@smartplate.com');
    console.log('   Password: password123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
