import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeIngredient,
  calculateRecipeMatch,
  filterRecipes,
  parseStepTimer,
  formatTime,
  aggregateShoppingList,
  Recipe,
  FilterState,
} from './culinaryLogic';

test('normalizeIngredient trims punctuation, qualifiers, and plurals', () => {
  assert.equal(normalizeIngredient('Fresh Organic Eggs'), 'egg');
  assert.equal(normalizeIngredient('2 cloves chopped garlic'), 'garlic');
  assert.equal(normalizeIngredient('Sliced Red Onions'), 'red onion');
});

test('calculateRecipeMatch determines percentage and missing items accurately', () => {
  const recipeIngredients = [
    { name: 'Eggs', optional: false },
    { name: 'Cheddar Cheese', optional: false },
    { name: 'Baby Spinach', optional: false },
    { name: 'Olive Oil', optional: true },
  ];
  const fridgeItems = ['Egg', 'Spinach', 'Milk'];

  const match = calculateRecipeMatch(recipeIngredients, fridgeItems);
  assert.equal(match.available.length, 2); // Eggs and Baby Spinach
  assert.ok(match.missing.includes('Cheddar Cheese'));
  assert.equal(match.matchPercentage, 67); // 2 of 3 non-optional items matched
});

test('filterRecipes filters by dietary restrictions, max time, and search', () => {
  const sampleRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Spinach & Feta Omelette',
      description: 'Quick protein breakfast',
      cuisine: 'Mediterranean',
      mealType: 'Breakfast',
      difficulty: 'Easy',
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      totalTimeMinutes: 15,
      calories: 320,
      dietaryTags: ['Vegetarian', 'Keto', 'Gluten-Free'],
      ingredients: [{ name: 'Eggs', amount: '3' }],
      steps: [{ stepNumber: 1, instruction: 'Whisk eggs' }],
    },
    {
      id: '2',
      title: 'Beef & Broccoli Stir Fry',
      description: 'Savory dinner with crisp broccoli',
      cuisine: 'Asian',
      mealType: 'Dinner',
      difficulty: 'Medium',
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      totalTimeMinutes: 35,
      calories: 550,
      dietaryTags: ['High-Protein', 'Dairy-Free'],
      ingredients: [{ name: 'Beef flank steak', amount: '1 lb' }],
      steps: [{ stepNumber: 1, instruction: 'Sear beef' }],
    },
  ];

  const ketoFilter: FilterState = {
    dietary: ['Keto'],
    difficulty: 'all',
    maxTime: 0,
    maxCalories: 0,
    search: '',
    onlyCookableNow: false,
  };
  const ketoResults = filterRecipes(sampleRecipes, ketoFilter);
  assert.equal(ketoResults.length, 1);
  assert.equal(ketoResults[0].id, '1');

  const fastFilter: FilterState = {
    dietary: [],
    difficulty: 'all',
    maxTime: 20,
    maxCalories: 0,
    search: '',
    onlyCookableNow: false,
  };
  assert.equal(filterRecipes(sampleRecipes, fastFilter).length, 1);

  const searchFilter: FilterState = {
    dietary: [],
    difficulty: 'all',
    maxTime: 0,
    maxCalories: 0,
    search: 'broccoli',
    onlyCookableNow: false,
  };
  assert.equal(filterRecipes(sampleRecipes, searchFilter).length, 1);
});

test('parseStepTimer extracts minutes from instructions', () => {
  assert.equal(parseStepTimer('Simmer on low for 15 minutes until reduced'), 15);
  assert.equal(parseStepTimer('Bake at 375°F for 20-25 mins'), 25);
  assert.equal(parseStepTimer('Chill in the refrigerator for 1.5 hours'), 90);
  assert.equal(parseStepTimer('Stir thoroughly and serve immediately'), null);
});

test('formatTime formats minutes nicely', () => {
  assert.equal(formatTime(25), '25m');
  assert.equal(formatTime(60), '1h');
  assert.equal(formatTime(85), '1h 25m');
});

test('aggregateShoppingList merges and prevents duplicate items', () => {
  const initial = [
    {
      id: '1',
      name: 'Olive Oil',
      category: 'Pantry',
      checked: true,
      createdAt: 1000,
    },
  ];

  const updated = aggregateShoppingList(initial, [
    { name: 'Olive oil', amount: '2 tbsp', recipeTitle: 'Pasta' },
    { name: 'Parmesan cheese', amount: '50g', recipeTitle: 'Pasta' },
  ]);

  assert.equal(updated.length, 2);
  // Olive oil should be unchecked
  assert.equal(updated[0].checked, false);
  assert.equal(updated[0].amount, '2 tbsp');
  assert.equal(updated[1].name, 'Parmesan cheese');
});
