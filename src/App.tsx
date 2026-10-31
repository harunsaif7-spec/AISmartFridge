import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Utensils,
  Camera,
  ShoppingBag,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Search,
  ArrowRight
} from 'lucide-react';
import { Header } from './components/Header';
import { FridgeScanner } from './components/FridgeScanner';
import { SidebarFilter } from './components/SidebarFilter';
import { RecipeCard } from './components/RecipeCard';
import { StepByStepModal } from './components/StepByStepModal';
import { ShoppingListTab } from './components/ShoppingListTab';
import {
  Ingredient,
  Recipe,
  ShoppingItem,
  FilterState,
  filterRecipes,
  aggregateShoppingList,
  calculateRecipeMatch,
} from './utils/culinaryLogic';
import { PRESET_FRIDGES } from './data/presetFridges';

export default function App() {
  const defaultPreset = PRESET_FRIDGES[0];

  // Active Tab: 'scanner' | 'recipes' | 'shopping'
  const [activeTab, setActiveTab] = useState<'scanner' | 'recipes' | 'shopping'>('scanner');

  // Core Data States
  const [detectedIngredients, setDetectedIngredients] = useState<Ingredient[]>(
    defaultPreset.ingredients
  );
  const [recipes, setRecipes] = useState<Recipe[]>(defaultPreset.recipes);
  const [currentImage, setCurrentImage] = useState<string | null>(defaultPreset.image);

  // Shopping List State (load initial from localStorage if available)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('culinarylens_shopping_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'init_1',
        name: 'Olive Oil',
        amount: '1 bottle',
        category: 'Pantry & Grocery',
        checked: false,
        addedFromRecipeTitle: 'Skillet Shakshuka',
        createdAt: Date.now(),
      },
    ];
  });

  // Save shopping list
  useEffect(() => {
    try {
      localStorage.setItem('culinarylens_shopping_list', JSON.stringify(shoppingList));
    } catch (e) {
      // ignore
    }
  }, [shoppingList]);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    dietary: [],
    difficulty: 'all',
    maxTime: 0,
    maxCalories: 0,
    search: '',
    onlyCookableNow: false,
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Cooking Mode Modal State
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  // Status & Notification states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshingRecipes, setIsRefreshingRecipes] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [modelBadge, setModelBadge] = useState<string | null>('Gemini 4 Argon Ready');

  // Trigger temporary notification toast
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  // Re-calculate match percentages dynamically whenever detectedIngredients change
  const enrichedRecipes = useMemo(() => {
    const availableNames = detectedIngredients.map((i) => i.name);
    return recipes.map((recipe) => {
      const { matchPercentage, missing, available } = calculateRecipeMatch(
        recipe.ingredients,
        availableNames
      );

      const updatedIngredients = recipe.ingredients.map((ing) => ({
        ...ing,
        isAvailable: available.includes(ing.name),
      }));

      return {
        ...recipe,
        matchPercentage,
        missingCount: missing.length,
        ingredients: updatedIngredients,
      };
    });
  }, [recipes, detectedIngredients]);

  // Filtered recipe list
  const filteredRecipes = useMemo(() => {
    return filterRecipes(enrichedRecipes, filters);
  }, [enrichedRecipes, filters]);

  // Analyze fridge photo via Gemini API
  const handleAnalyzeFridgePhoto = async (base64Image: string) => {
    setIsAnalyzing(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/fridge/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          dietaryPreferences: filters.dietary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.detectedIngredients && data.detectedIngredients.length > 0) {
        setDetectedIngredients(data.detectedIngredients);
      }

      if (data.recipes && data.recipes.length > 0) {
        setRecipes(data.recipes);
      }

      if (data.modelUsed) {
        setModelBadge(`Analyzed with ${data.modelUsed}`);
      }

      showToast(`AI spotted ${data.detectedIngredients?.length || 0} ingredients! Created ${data.recipes?.length || 0} recipes.`, 'success');
      // Automatically navigate to recipes tab to view suggestions
      setTimeout(() => {
        setActiveTab('recipes');
      }, 800);
    } catch (err: any) {
      console.warn('API fridge analysis error, using fallback matching:', err);
      showToast(
        err.message?.includes('GEMINI_API_KEY')
          ? 'API key required for live AI analysis. Running in demo mode with sample scans.'
          : `Analysis notice: ${err.message || 'Connecting to vision model'}`,
        'info'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate / Refresh recipes on demand
  const handleRefreshRecipes = async () => {
    if (detectedIngredients.length === 0) return;
    setIsRefreshingRecipes(true);

    try {
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: detectedIngredients.map((i) => i.name),
          dietaryPreferences: filters.dietary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recipes && data.recipes.length > 0) {
          setRecipes(data.recipes);
          showToast(`Generated ${data.recipes.length} fresh recipe ideas!`, 'success');
          setActiveTab('recipes');
        }
      }
    } catch (e) {
      console.warn('Could not refresh from API:', e);
    } finally {
      setIsRefreshingRecipes(false);
    }
  };

  // Add all missing ingredients of a recipe to shopping list
  const handleAddMissingToShoppingList = (recipe: Recipe) => {
    const missing = recipe.ingredients.filter((i) => !i.isAvailable && !i.optional);
    if (missing.length === 0) {
      showToast('All ingredients for this recipe are already in your fridge!', 'info');
      return;
    }

    const itemsToAdd = missing.map((m) => ({
      name: m.name,
      amount: m.amount,
      recipeTitle: recipe.title,
    }));

    setShoppingList((prev) => aggregateShoppingList(prev, itemsToAdd));
    showToast(`Added ${missing.length} missing items to Shopping List!`, 'success');
  };

  // Add single ingredient to shopping list
  const handleAddSingleToShoppingList = (name: string, amount: string, recipeTitle: string) => {
    setShoppingList((prev) =>
      aggregateShoppingList(prev, [{ name, amount, recipeTitle }])
    );
    showToast(`Added "${name}" to Shopping List`, 'success');
  };

  const shoppingListNames = useMemo(
    () => shoppingList.map((i) => i.name),
    [shoppingList]
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Plus_Jakarta_Sans'] w-full max-w-full overflow-x-hidden">
      {/* Toast Notification Banner */}
      {statusMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top duration-300">
          <div
            className={`p-3.5 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs sm:text-sm font-semibold backdrop-blur-md ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                : 'bg-stone-900/95 text-stone-200 border-stone-700'
            }`}
          >
            {statusMessage.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {statusMessage.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            {statusMessage.type === 'info' && (
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        detectedCount={detectedIngredients.length}
        recipeCount={recipes.length}
        shoppingCount={shoppingList.filter((i) => !i.checked).length}
        onQuickUploadClick={() => {
          setActiveTab('scanner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* App Body Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Model Engine Status Pill */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-850">
          <div className="flex items-center space-x-2 text-xs text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Kitchen Assistant Online</span>
            {modelBadge && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-stone-850 text-stone-300 text-[11px] font-mono border border-stone-800">
                {modelBadge}
              </span>
            )}
          </div>

          {activeTab === 'recipes' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Filters {filters.dietary.length > 0 && `(${filters.dietary.length})`}</span>
              </button>

              <button
                onClick={handleRefreshRecipes}
                disabled={isRefreshingRecipes}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold transition"
                title="Ask AI for more recipe ideas"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshingRecipes ? 'animate-spin' : ''}`} />
                <span>{isRefreshingRecipes ? 'Crafting...' : 'More Recipes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Fridge Scanner */}
        {activeTab === 'scanner' && (
          <FridgeScanner
            detectedIngredients={detectedIngredients}
            setDetectedIngredients={setDetectedIngredients}
            currentImage={currentImage}
            setCurrentImage={setCurrentImage}
            onAnalyzeImage={handleAnalyzeFridgePhoto}
            isLoading={isAnalyzing}
            onNavigateToRecipes={() => setActiveTab('recipes')}
            recipeCount={recipes.length}
          />
        )}

        {/* Tab 2: Recipe Suggestions with Sidebar Filter */}
        {activeTab === 'recipes' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Filter for Dietary Restrictions */}
            <SidebarFilter
              filters={filters}
              setFilters={setFilters}
              totalMatches={filteredRecipes.length}
              isOpenMobile={isMobileFiltersOpen}
              onCloseMobile={() => setIsMobileFiltersOpen(false)}
            />

            {/* Scrollable Recipe Cards List */}
            <div className="flex-1 w-full space-y-6">
              {/* Recipe Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-stone-900/50 border border-stone-850">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
                    <ChefHat className="w-5 h-5 text-amber-400" />
                    <span>Suggested Recipes for Your Fridge</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Ranked by ingredient availability &bull; Tap any card to start step-by-step hands-free cooking.
                  </p>
                </div>

                <div className="text-xs text-stone-400 shrink-0">
                  Showing <span className="text-emerald-400 font-bold">{filteredRecipes.length}</span> of {recipes.length} dishes
                </div>
              </div>

              {/* Empty Filter State */}
              {filteredRecipes.length === 0 ? (
                <div className="py-20 px-6 text-center rounded-3xl bg-stone-900/40 border border-stone-800 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-850 flex items-center justify-center text-stone-500">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">No Recipes Match Current Filters</h3>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Try relaxing your dietary or time filters, or ask AI to generate new recipes with different ingredients.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setFilters({
                        dietary: [],
                        difficulty: 'all',
                        maxTime: 0,
                        maxCalories: 0,
                        search: '',
                        onlyCookableNow: false,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                /* Recipe Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onSelectRecipe={(r) => setCookingRecipe(r)}
                      onAddMissingToShoppingList={handleAddMissingToShoppingList}
                      onAddSingleToShoppingList={handleAddSingleToShoppingList}
                      shoppingListNames={shoppingListNames}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Shopping List */}
        {activeTab === 'shopping' && (
          <ShoppingListTab
            items={shoppingList}
            setItems={setShoppingList}
            onNavigateToRecipes={() => setActiveTab('recipes')}
          />
        )}
      </main>

      {/* Step-by-Step Cooking Mode Modal */}
      {cookingRecipe && (
        <StepByStepModal
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
          onAddIngredientToShoppingList={handleAddSingleToShoppingList}
          shoppingListNames={shoppingListNames}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-900 bg-stone-950/80 py-6 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-400">CulinaryLens AI</span>
            <span>&bull;</span>
            <span>Powered by Gemini Multimodal Vision & Speech</span>
          </div>
          <div>
            <span>Turn fridge inventory into delicious dinners with zero food waste.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
