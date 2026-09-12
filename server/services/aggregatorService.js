/**
 * Normalizes an ingredient name for safe duplicate matching.
 * e.g., "Tomatoes " -> "tomato", "Onions" -> "onion", "garlic cloves" -> "garlic clove"
 */
export const normalizeIngredientName = (rawName) => {
  if (!rawName) return '';
  let name = rawName.toLowerCase().trim();

  // Basic irregular plural stems
  if (name.endsWith('berries')) {
    name = name.slice(0, -7) + 'berry';
  } else if (name.endsWith('tomatoes')) {
    name = name.slice(0, -8) + 'tomato';
  } else if (name.endsWith('potatoes')) {
    name = name.slice(0, -8) + 'potato';
  } else if (name.endsWith('leaves')) {
    name = name.slice(0, -6) + 'leaf';
  } else if (name.endsWith('es') && (name.endsWith('shes') || name.endsWith('ches') || name.endsWith('xes'))) {
    name = name.slice(0, -2);
  } else if (name.endsWith('s') && !name.endsWith('ss') && !name.endsWith('us') && !name.endsWith('is')) {
    name = name.slice(0, -1);
  }

  return name.trim();
};

/**
 * Normalizes common cooking units so "cups" and "cup" or "tbsp" and "tablespoon" group together.
 */
export const normalizeUnit = (rawUnit) => {
  if (!rawUnit) return 'piece';
  const unit = rawUnit.toLowerCase().trim();

  const unitMap = {
    cup: 'cups',
    cups: 'cups',
    c: 'cups',
    tbsp: 'tbsp',
    tablespoon: 'tbsp',
    tablespoons: 'tbsp',
    tbs: 'tbsp',
    tsp: 'tsp',
    teaspoon: 'tsp',
    teaspoons: 'tsp',
    gram: 'g',
    grams: 'g',
    g: 'g',
    kg: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    ml: 'ml',
    milliliter: 'ml',
    milliliters: 'ml',
    l: 'l',
    liter: 'l',
    liters: 'l',
    litre: 'l',
    litres: 'l',
    oz: 'oz',
    ounce: 'oz',
    ounces: 'oz',
    lb: 'lb',
    lbs: 'lb',
    pound: 'lb',
    pounds: 'lb',
    piece: 'pieces',
    pieces: 'pieces',
    pc: 'pieces',
    pcs: 'pieces',
    clove: 'cloves',
    cloves: 'cloves',
    pinch: 'pinches',
    pinches: 'pinches',
    slice: 'slices',
    slices: 'slices',
    can: 'cans',
    cans: 'cans',
    stalk: 'stalks',
    stalks: 'stalks',
    bunch: 'bunches',
    bunches: 'bunches',
  };

  return unitMap[unit] || unit;
};

/**
 * Converts a normalized name back to a pleasant display name (Title Case).
 */
export const formatDisplayName = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Aggregates ingredients from a list of meals, taking serving scaling into account.
 *
 * @param {Array} meals - Array of meal objects with populated recipe and servings
 * @returns {Array} consolidated ingredient list
 */
export const aggregateIngredients = (meals) => {
  const aggregatedMap = new Map();

  for (const meal of meals) {
    if (!meal.recipe || !meal.recipe.ingredients) continue;

    const plannedServings = Number(meal.servings) || 2;
    const baseServings = Number(meal.recipe.servings) || 2;
    const multiplier = plannedServings / (baseServings > 0 ? baseServings : 1);

    for (const ing of meal.recipe.ingredients) {
      if (!ing.name || typeof ing.quantity !== 'number') continue;

      const normName = normalizeIngredientName(ing.name);
      const normUnit = normalizeUnit(ing.unit);
      const scaledQuantity = ing.quantity * multiplier;

      // Group key is strictly (normalizedName, normalizedUnit)
      // Different units (e.g. cups vs grams) remain separate items
      const groupKey = `${normName}:::${normUnit}`;

      if (aggregatedMap.has(groupKey)) {
        const existing = aggregatedMap.get(groupKey);
        existing.quantity += scaledQuantity;
      } else {
        aggregatedMap.set(groupKey, {
          name: formatDisplayName(normName),
          normalizedName: normName,
          quantity: scaledQuantity,
          unit: normUnit,
        });
      }
    }
  }

  // Convert map values to array and round cleanly (up to 2 decimals)
  return Array.from(aggregatedMap.values()).map((item) => ({
    ...item,
    quantity: Math.round(item.quantity * 100) / 100,
  }));
};
