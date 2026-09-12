import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import { sampleRecipes } from './seedData.js';

export const autoSeedIfEmpty = async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count > 0) {
      console.log(`[AutoSeed] Database already contains ${count} recipes. Skipping seed.`);
      return;
    }

    console.log('[AutoSeed] Empty database detected. Auto-seeding 15 curated recipes and demo user...');

    let demoUser = await User.findOne({ email: 'chef@smartplate.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Chef Alex',
        email: 'chef@smartplate.com',
        password: 'password123',
      });
    }

    const recipesWithOwner = sampleRecipes.map((recipe) => ({
      ...recipe,
      owner: demoUser._id,
      isPublic: true,
    }));

    const created = await Recipe.insertMany(recipesWithOwner);
    demoUser.favorites = [created[0]._id, created[3]._id, created[6]._id];
    await demoUser.save();

    console.log(`[AutoSeed] Successfully seeded ${created.length} recipes into database!`);
  } catch (err) {
    console.warn('[AutoSeed] Note: Auto-seed skipped or encountered error:', err.message);
  }
};
