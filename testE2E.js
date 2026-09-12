const BASE = 'http://localhost:5000/api';

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    throw new Error(msg);
  }
  console.log(`  ✓ ${msg}`);
};

const runFullScenario = async () => {
  console.log('\n======================================================');
  console.log(' RUNNING COMPLETE 20-STEP END-TO-END ACCEPTANCE TEST ');
  console.log('======================================================\n');

  // Step 1: Register a user
  console.log('Step 1: Registering a new test user...');
  const testEmail = `testuser_${Date.now()}@smartplate.com`;
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Tester Chef',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
    }),
  }).then((r) => r.json());
  assert(regRes.success && regRes.token, 'User registered successfully with JWT');
  let token = regRes.token;
  let authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Step 2: Login
  console.log('\nStep 2: Logging in...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' }),
  }).then((r) => r.json());
  assert(loginRes.success && loginRes.user.email === testEmail, 'Login successful with verified token');

  // Step 3: Create at least 3 recipes
  console.log('\nStep 3: Creating 3 custom recipes...');
  const recipeData1 = {
    title: 'Custom Garlic Butter Pasta',
    description: 'Fresh pasta with garlic, butter, and parmesan.',
    category: 'Dinner',
    tags: ['Vegetarian', 'Quick Meals'],
    servings: 2,
    prepTime: 10,
    cookTime: 15,
    ingredients: [
      { name: 'Spaghetti', quantity: 200, unit: 'g' },
      { name: 'Garlic', quantity: 4, unit: 'cloves' },
      { name: 'Butter', quantity: 2, unit: 'tbsp' },
      { name: 'Tomato', quantity: 2, unit: 'pieces' },
    ],
    instructions: ['Boil pasta', 'Melt butter with garlic', 'Toss and serve'],
  };

  const recipeData2 = {
    title: 'Custom Fresh Tomato Salad',
    description: 'Crisp diced tomatoes with herbs and olive oil.',
    category: 'Lunch',
    tags: ['Vegan', 'Healthy'],
    servings: 2,
    prepTime: 5,
    cookTime: 0,
    ingredients: [
      { name: 'Tomato', quantity: 3, unit: 'pieces' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
      { name: 'Garlic', quantity: 1, unit: 'cloves' },
    ],
    instructions: ['Dice tomatoes', 'Whisk olive oil and minced garlic', 'Drizzle and enjoy'],
  };

  const recipeData3 = {
    title: 'Morning Berry Smoothie',
    description: 'Refreshing blueberry and almond milk blend.',
    category: 'Breakfast',
    tags: ['Vegan', 'Quick Meals'],
    servings: 1,
    prepTime: 5,
    cookTime: 0,
    ingredients: [
      { name: 'Blueberries', quantity: 1, unit: 'cups' },
      { name: 'Almond Milk', quantity: 1, unit: 'cups' },
      { name: 'Chia Seeds', quantity: 1, unit: 'tbsp' },
    ],
    instructions: ['Blend all ingredients until smooth'],
  };

  const r1 = await fetch(`${BASE}/recipes`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(recipeData1),
  }).then((r) => r.json());
  assert(r1.success, `Created Recipe 1: ${r1.data.title}`);

  const r2 = await fetch(`${BASE}/recipes`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(recipeData2),
  }).then((r) => r.json());
  assert(r2.success, `Created Recipe 2: ${r2.data.title}`);

  const r3 = await fetch(`${BASE}/recipes`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(recipeData3),
  }).then((r) => r.json());
  assert(r3.success, `Created Recipe 3: ${r3.data.title}`);

  // Step 4: Add recipes to favorites
  console.log('\nStep 4: Adding recipes to favorites...');
  const favRes1 = await fetch(`${BASE}/recipes/${r1.data._id}/favorite`, {
    method: 'POST',
    headers: authHeaders,
  }).then((r) => r.json());
  assert(favRes1.isFavorite === true, 'Added Recipe 1 to favorites');

  const favList = await fetch(`${BASE}/recipes/favorites`, { headers: authHeaders }).then((r) => r.json());
  assert(favList.count >= 1, `Verified favorite count: ${favList.count}`);

  // Step 5 & 6: Create weekly meal plan and assign recipes to multiple days
  console.log('\nStep 5 & 6: Creating weekly meal plan across multiple days...');
  const weekStartDate = '2025-09-22';

  // Monday Dinner: Recipe 1 with 4 servings (Base is 2, so multiplier = 2)
  const plan1 = await fetch(`${BASE}/meal-plans`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      weekStartDate,
      date: '2025-09-22',
      dayOfWeek: 'Monday',
      mealType: 'Dinner',
      recipeId: r1.data._id,
      servings: 4, // 2x base
    }),
  }).then((r) => r.json());
  assert(plan1.success, 'Scheduled Monday Dinner (Recipe 1, 4 servings)');

  // Tuesday Lunch: Recipe 2 with 4 servings (Base is 2, so multiplier = 2)
  const plan2 = await fetch(`${BASE}/meal-plans`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      weekStartDate,
      date: '2025-09-23',
      dayOfWeek: 'Tuesday',
      mealType: 'Lunch',
      recipeId: r2.data._id,
      servings: 4, // 2x base
    }),
  }).then((r) => r.json());
  assert(plan2.success, 'Scheduled Tuesday Lunch (Recipe 2, 4 servings)');

  // Step 7: Use different serving sizes (Wednesday Breakfast with 3 servings for Recipe 3)
  const plan3 = await fetch(`${BASE}/meal-plans`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      weekStartDate,
      date: '2025-09-24',
      dayOfWeek: 'Wednesday',
      mealType: 'Breakfast',
      recipeId: r3.data._id,
      servings: 3, // 3x base
    }),
  }).then((r) => r.json());
  assert(plan3.success, 'Scheduled Wednesday Breakfast (Recipe 3, 3 servings)');

  // Step 8: Generate Shopping List
  console.log('\nStep 8: Generating shopping list from meal plan...');
  const genRes = await fetch(`${BASE}/shopping-list/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ weekStartDate }),
  }).then((r) => r.json());
  assert(genRes.success, `Shopping list generated: ${genRes.message}`);

  // Step 9 & 10: Verify duplicate ingredients combined & serving size calculations
  console.log('\nStep 9 & 10: Verifying serving scaling and duplicate ingredient consolidation...');
  // Calculation check:
  // Recipe 1 (servings: 4, base: 2 => mult: 2) has Tomato: 2 pieces -> 4 pieces
  // Recipe 2 (servings: 4, base: 2 => mult: 2) has Tomato: 3 pieces -> 6 pieces
  // Total Tomato should be exactly 4 + 6 = 10 pieces!
  const tomatoItem = genRes.data.find(
    (i) => i.normalizedName === 'tomato' && i.unit === 'pieces'
  );
  assert(tomatoItem !== undefined, 'Found aggregated "Tomato" item');
  assert(
    tomatoItem.quantity === 10,
    `Tomato correctly scaled and combined: expected 10 pieces, got ${tomatoItem.quantity} ${tomatoItem.unit}`
  );

  // Garlic check:
  // Recipe 1 (mult 2): 4 cloves -> 8 cloves
  // Recipe 2 (mult 2): 1 clove -> 2 cloves
  // Total Garlic should be exactly 8 + 2 = 10 cloves!
  const garlicItem = genRes.data.find(
    (i) => i.normalizedName === 'garlic' && i.unit === 'cloves'
  );
  assert(garlicItem !== undefined, 'Found aggregated "Garlic" item');
  assert(
    garlicItem.quantity === 10,
    `Garlic correctly scaled and combined: expected 10 cloves, got ${garlicItem.quantity} ${garlicItem.unit}`
  );

  // Step 11: Add a manual grocery item
  console.log('\nStep 11: Adding manual grocery item...');
  const manualItem = await fetch(`${BASE}/shopping-list`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Fresh Basil', quantity: 2, unit: 'bunches' }),
  }).then((r) => r.json());
  assert(manualItem.success && manualItem.data.name === 'Fresh Basil', 'Manual item added');

  // Step 12: Mark items as purchased
  console.log('\nStep 12: Marking items as purchased...');
  const toggleRes = await fetch(`${BASE}/shopping-list/${manualItem.data._id}/toggle`, {
    method: 'PUT',
    headers: authHeaders,
  }).then((r) => r.json());
  assert(toggleRes.data.purchased === true, 'Marked manual item as purchased');

  // Step 13 & 14: Refresh/reload and verify persistence
  console.log('\nStep 13 & 14: Verifying data persistence after simulated refresh...');
  const listReload = await fetch(`${BASE}/shopping-list`, { headers: authHeaders }).then((r) => r.json());
  const reloadedManual = listReload.data.find((i) => i._id === manualItem.data._id);
  assert(reloadedManual && reloadedManual.purchased === true, 'Persisted purchased state verified');

  // Step 15: Edit a recipe
  console.log('\nStep 15: Editing Recipe 1...');
  const updatedRecipe = await fetch(`${BASE}/recipes/${r1.data._id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Custom Garlic Butter Pasta (Updated)' }),
  }).then((r) => r.json());
  assert(
    updatedRecipe.data.title === 'Custom Garlic Butter Pasta (Updated)',
    'Recipe title updated successfully'
  );

  // Step 16: Remove a meal from the plan
  console.log('\nStep 16: Removing Monday Dinner meal slot...');
  const slotToRemove = plan1.data.meals[0]._id;
  const planAfterRemove = await fetch(`${BASE}/meal-plans/slot/${slotToRemove}`, {
    method: 'DELETE',
    headers: authHeaders,
  }).then((r) => r.json());
  assert(planAfterRemove.data.meals.length === 2, 'Meal slot removed, 2 meals remain');

  // Step 17: Regenerate/update the shopping list
  console.log('\nStep 17: Regenerating shopping list after removing Monday Dinner...');
  const regenRes = await fetch(`${BASE}/shopping-list/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ weekStartDate }),
  }).then((r) => r.json());
  // Now Recipe 1 is removed from plan, so Tomato is only from Recipe 2 (6 pieces)
  const regenTomato = regenRes.data.find(
    (i) => i.normalizedName === 'tomato' && i.unit === 'pieces'
  );
  assert(
    regenTomato && regenTomato.quantity === 6,
    `Regenerated shopping list reflected removal: Tomato is now 6 pieces (was 10)`
  );

  // Step 18: Logout
  console.log('\nStep 18: Logging out...');
  const logoutRes = await fetch(`${BASE}/auth/logout`, { method: 'POST' }).then((r) => r.json());
  assert(logoutRes.success, 'Logout successful');

  // Step 19 & 20: Login again and verify user data is still available
  console.log('\nStep 19 & 20: Logging in again and verifying user data availability...');
  const reloginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' }),
  }).then((r) => r.json());
  assert(reloginRes.success && reloginRes.user.name === 'Tester Chef', 'Re-login successful');

  const newAuthHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${reloginRes.token}`,
  };

  const finalPlan = await fetch(`${BASE}/meal-plans/${weekStartDate}`, {
    headers: newAuthHeaders,
  }).then((r) => r.json());
  assert(finalPlan.data.meals.length === 2, 'Meal plan still persisted across login sessions');

  const finalFavs = await fetch(`${BASE}/recipes/favorites`, {
    headers: newAuthHeaders,
  }).then((r) => r.json());
  assert(finalFavs.count >= 1, 'Favorites still persisted across login sessions');

  console.log('\n=============================================================');
  console.log(' ✨ ALL 20 ACCEPTANCE CRITERIA STEPS PASSED WITH 100% SUCCESS! ');
  console.log('=============================================================\n');
  process.exit(0);
};

runFullScenario().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
