export interface Ingredient {
  id: string;
  name: string;
  category: string;
  amount?: string;
  freshness?: 'fresh' | 'use-soon' | 'staple';
  confidence?: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  isAvailable?: boolean;
  optional?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timeInMinutes?: number;
  tip?: string;
  highlightIngredients?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  mealType: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  dietaryTags: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  missingCount?: number;
  matchPercentage?: number;
  chefNote?: string;
  servings?: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: string;
  category: string;
  checked: boolean;
  addedFromRecipeTitle?: string;
  createdAt: number;
}

export interface FilterState {
  dietary: string[];
  difficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
  maxTime: number; // minutes, 0 = any
  maxCalories: number; // 0 = any
  search: string;
  onlyCookableNow: boolean; // 100% ingredients available
}

/**
 * Normalizes an ingredient name for flexible matching (e.g. "large red eggs" -> "egg")
 */
export function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,\(\)\.\*]/g, '')
    .replace(/\b\d+(\/\d+)?(\.\d+)?\b/g, '')
    .replace(/\b(organic|fresh|chopped|diced|minced|sliced|large|small|medium|cup|cups|tbsp|tsp|tablespoon|teaspoon|pinch|clove|cloves|bunch|bunches|oz|ounce|ounces|pound|pounds|lb|lbs|g|gram|grams|ml|package|can|bottle)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/s\b/g, ''); // simple plural trim
}

/**
 * Calculates match percentage and missing items between recipe requirements and fridge ingredients
 */
export function calculateRecipeMatch(
  recipeIngredients: { name: string; optional?: boolean }[],
  availableIngredients: string[]
): { matchPercentage: number; missing: string[]; available: string[] } {
  if (!recipeIngredients || recipeIngredients.length === 0) {
    return { matchPercentage: 100, missing: [], available: [] };
  }

  const normalizedAvailable = availableIngredients.map(normalizeIngredient);
  const available: string[] = [];
  const missing: string[] = [];

  for (const item of recipeIngredients) {
    const normItem = normalizeIngredient(item.name);
    const hasMatch = normalizedAvailable.some(
      (avail) =>
        avail.length > 2 &&
        (normItem.includes(avail) || avail.includes(normItem))
    );

    if (hasMatch) {
      available.push(item.name);
    } else {
      missing.push(item.name);
    }
  }

  const totalRequired = recipeIngredients.filter((i) => !i.optional).length || recipeIngredients.length;
  const matchedRequired = recipeIngredients.filter(
    (i) => !i.optional && available.includes(i.name)
  ).length;

  const matchPercentage = Math.round((matchedRequired / totalRequired) * 100);

  return { matchPercentage, missing, available };
}

/**
 * Filters a list of recipes according to dietary, difficulty, and time preferences
 */
export function filterRecipes(recipes: Recipe[], filters: FilterState): Recipe[] {
  return recipes.filter((recipe) => {
    // Search query filter
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const inTitle = recipe.title.toLowerCase().includes(q);
      const inDesc = recipe.description.toLowerCase().includes(q);
      const inIngredients = recipe.ingredients.some((i) =>
        i.name.toLowerCase().includes(q)
      );
      if (!inTitle && !inDesc && !inIngredients) return false;
    }

    // Dietary restrictions filter (ALL selected dietary tags must be met)
    if (filters.dietary && filters.dietary.length > 0) {
      const recipeTags = (recipe.dietaryTags || []).map((t) => t.toLowerCase());
      const hasAllDietary = filters.dietary.every((filterTag) =>
        recipeTags.some((rt) => rt.includes(filterTag.toLowerCase()))
      );
      if (!hasAllDietary) return false;
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      if (recipe.difficulty.toLowerCase() !== filters.difficulty.toLowerCase()) {
        return false;
      }
    }

    // Max time filter (in minutes)
    if (filters.maxTime > 0) {
      const time = recipe.totalTimeMinutes || recipe.prepTimeMinutes + recipe.cookTimeMinutes;
      if (time > filters.maxTime) return false;
    }

    // Max calories filter
    if (filters.maxCalories > 0 && recipe.calories > filters.maxCalories) {
      return false;
    }

    // Only cookable now filter (0 missing items or match percentage 100)
    if (filters.onlyCookableNow) {
      const missingCount =
        recipe.missingCount !== undefined
          ? recipe.missingCount
          : recipe.ingredients.filter((i) => !i.isAvailable && !i.optional).length;
      if (missingCount > 0) return false;
    }

    return true;
  });
}

/**
 * Extracts estimated time in minutes from a step instruction if available
 */
export function parseStepTimer(instruction: string): number | null {
  if (!instruction) return null;
  // Match patterns like "10 minutes", "15-20 mins", "about 5 min", "1 hour", "1.5 hours"
  const hourMatch = instruction.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)/i);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }

  const rangeMatch = instruction.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*(?:minutes|mins|min)/i);
  if (rangeMatch) {
    return parseInt(rangeMatch[2], 10); // Return upper bound or average
  }

  const minMatch = instruction.match(/(\d+)\s*(?:minutes|mins|min)/i);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  return null;
}

/**
 * Formats time in minutes to human friendly string (e.g. "45m" or "1h 15m")
 */
export function formatTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '10m';
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

/**
 * Adds items to shopping list avoiding duplicate names
 */
export function aggregateShoppingList(
  currentList: ShoppingItem[],
  newItems: { name: string; amount?: string; category?: string; recipeTitle?: string }[]
): ShoppingItem[] {
  const result = [...currentList];

  for (const item of newItems) {
    const trimmed = item.name.trim();
    if (!trimmed) continue;

    const existingIndex = result.findIndex(
      (existing) => normalizeIngredient(existing.name) === normalizeIngredient(trimmed)
    );

    if (existingIndex >= 0) {
      // If already present but checked, uncheck to repurchase
      result[existingIndex] = {
        ...result[existingIndex],
        checked: false,
        amount: item.amount || result[existingIndex].amount,
      };
    } else {
      result.push({
        id: 'shop_' + Math.random().toString(36).substring(2, 9),
        name: trimmed,
        amount: item.amount,
        category: item.category || 'Pantry & Grocery',
        checked: false,
        addedFromRecipeTitle: item.recipeTitle,
        createdAt: Date.now(),
      });
    }
  }

  return result;
}
