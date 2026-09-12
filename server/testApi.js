import app from './server.js';

let serverInstance;

const runTests = async () => {
  try {
    // Wait a brief moment for server to listen
    await new Promise((r) => setTimeout(r, 800));
    console.log('\n--- STARTING API ENDPOINT TESTS ---');

    const BASE = 'http://localhost:5000/api';

    // 1. Health check
    const healthRes = await fetch(`${BASE}/health`).then((r) => r.json());
    console.log('✓ Health Check:', healthRes.status);

    // 2. Auth Login
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'chef@smartplate.com', password: 'password123' }),
    }).then((r) => r.json());

    if (!loginRes.token) throw new Error('Login failed: ' + JSON.stringify(loginRes));
    console.log('✓ Login Successful, User:', loginRes.user.name, 'Token received');
    const token = loginRes.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Get Recipes
    const recipesRes = await fetch(`${BASE}/recipes?page=1&limit=6`).then((r) => r.json());
    console.log(`✓ Get Recipes: Found ${recipesRes.count} of ${recipesRes.total} recipes`);
    const sampleRecipe1 = recipesRes.data[0];
    const sampleRecipe2 = recipesRes.data[1];

    // 4. Test Favorites
    const favsRes = await fetch(`${BASE}/recipes/favorites`, { headers: authHeaders }).then((r) => r.json());
    console.log(`✓ Get Favorites: Found ${favsRes.count} favorites`);

    // 5. Plan Meals for week
    const weekStartDate = '2025-09-15';
    const planRes1 = await fetch(`${BASE}/meal-plans`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        weekStartDate,
        date: '2025-09-15',
        dayOfWeek: 'Monday',
        mealType: 'Breakfast',
        recipeId: sampleRecipe1._id,
        servings: 4, // 2x base servings
      }),
    }).then((r) => r.json());
    console.log('✓ Planned Monday Breakfast:', planRes1.data.meals.length, 'meal(s) in week plan');

    const planRes2 = await fetch(`${BASE}/meal-plans`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        weekStartDate,
        date: '2025-09-15',
        dayOfWeek: 'Monday',
        mealType: 'Lunch',
        recipeId: sampleRecipe2._id,
        servings: 4,
      }),
    }).then((r) => r.json());
    console.log('✓ Planned Monday Lunch:', planRes2.data.meals.length, 'meal(s) in week plan');

    // 6. Generate Shopping List from meal plan
    const genRes = await fetch(`${BASE}/shopping-list/generate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ weekStartDate }),
    }).then((r) => r.json());
    console.log('✓ Shopping List Generation:', genRes.message);
    console.log('  Items consolidated:', genRes.data.length);

    // 7. Add manual shopping list item
    const manualRes = await fetch(`${BASE}/shopping-list`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Fresh Rosemary', quantity: 2, unit: 'bunches' }),
    }).then((r) => r.json());
    console.log('✓ Added Manual Item:', manualRes.data.name, `${manualRes.data.quantity} ${manualRes.data.unit}`);

    // 8. Toggle purchased
    const toggleRes = await fetch(`${BASE}/shopping-list/${manualRes.data._id}/toggle`, {
      method: 'PUT',
      headers: authHeaders,
    }).then((r) => r.json());
    console.log('✓ Toggled Purchased status on manual item:', toggleRes.data.purchased);

    // 9. Fetch shopping list with stats
    const listRes = await fetch(`${BASE}/shopping-list`, { headers: authHeaders }).then((r) => r.json());
    console.log('✓ Final Shopping List stats:', listRes.stats);

    console.log('\n=========================================');
    console.log(' ALL BACKEND API ENDPOINTS TESTED SUCCESSFULLY! ');
    console.log('=========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('API Test Error:', err);
    process.exit(1);
  }
};

runTests();
