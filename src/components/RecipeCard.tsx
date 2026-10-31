import React from 'react';
import {
  Clock,
  Flame,
  ChefHat,
  Sparkles,
  ShoppingBag,
  Plus,
  Check,
  ChevronRight,
  Gauge,
  Utensils
} from 'lucide-react';
import { Recipe, formatTime } from '../utils/culinaryLogic';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
  onAddMissingToShoppingList: (recipe: Recipe) => void;
  onAddSingleToShoppingList: (ingredientName: string, amount: string, recipeTitle: string) => void;
  shoppingListNames: string[];
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelectRecipe,
  onAddMissingToShoppingList,
  onAddSingleToShoppingList,
  shoppingListNames,
}) => {
  const missingIngredients = recipe.ingredients.filter((i) => !i.isAvailable && !i.optional);
  const availableIngredients = recipe.ingredients.filter((i) => i.isAvailable);

  const difficultyColors = {
    Easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };

  const matchScore = recipe.matchPercentage !== undefined
    ? recipe.matchPercentage
    : recipe.ingredients.length > 0
    ? Math.round((availableIngredients.length / recipe.ingredients.length) * 100)
    : 100;

  return (
    <div className="group rounded-3xl bg-stone-900/80 border border-stone-800 hover:border-stone-700/80 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-emerald-950/20 hover:-translate-y-0.5">
      {/* Top Banner / Tags */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                difficultyColors[recipe.difficulty] || difficultyColors.Easy
              }`}
            >
              {recipe.difficulty}
            </span>

            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-stone-800 text-stone-300 border border-stone-700">
              {recipe.cuisine} &bull; {recipe.mealType}
            </span>
          </div>

          {/* Match Score Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{matchScore}% Match</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3
          onClick={() => onSelectRecipe(recipe)}
          className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer leading-snug font-['Plus_Jakarta_Sans']"
        >
          {recipe.title}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Dietary Tag Pills */}
        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-lg bg-stone-950/80 border border-stone-800 text-stone-400 text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Key Metrics Strip: Time, Calories, Steps */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-stone-950/70 border border-stone-800/80 text-center">
          <div>
            <div className="flex items-center justify-center space-x-1 text-stone-400 text-[11px] font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Time</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {formatTime(recipe.totalTimeMinutes || recipe.prepTimeMinutes + recipe.cookTimeMinutes)}
            </div>
            <div className="text-[10px] text-stone-400">
              prep {recipe.prepTimeMinutes}m &bull; cook {recipe.cookTimeMinutes}m
            </div>
          </div>

          <div className="border-x border-stone-800">
            <div className="flex items-center justify-center space-x-1 text-stone-400 text-[11px] font-medium">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Calories</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {recipe.calories} kcal
            </div>
            <div className="text-[10px] text-stone-400">
              {recipe.protein ? `${recipe.protein}g pro` : 'per serving'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center space-x-1 text-stone-400 text-[11px] font-medium">
              <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
              <span>Steps</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {recipe.steps.length} Steps
            </div>
            <div className="text-[10px] text-emerald-400">Audio Guide</div>
          </div>
        </div>

        {/* Ingredients Breakdown Preview */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-300">
              Ingredients ({availableIngredients.length}/{recipe.ingredients.length} in fridge)
            </span>
            {missingIngredients.length > 0 && (
              <span className="text-[11px] text-amber-400 font-semibold">
                {missingIngredients.length} missing
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {recipe.ingredients.map((ing, idx) => {
              const isAlreadyInCart = shoppingListNames.some(
                (n) => n.toLowerCase().trim() === ing.name.toLowerCase().trim()
              );

              return (
                <span
                  key={idx}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-medium border ${
                    ing.isAvailable
                      ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                      : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/50'
                  }`}
                >
                  {ing.isAvailable ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSingleToShoppingList(ing.name, ing.amount, recipe.title);
                      }}
                      className="text-amber-400 hover:text-amber-300 p-0.5"
                      title={isAlreadyInCart ? 'In Shopping List' : 'Add to Shopping List'}
                      aria-label={`Add ${ing.name} to Shopping List`}
                    >
                      {isAlreadyInCart ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </button>
                  )}
                  <span>{ing.name}</span>
                  <span className="text-[10px] text-stone-400">({ing.amount})</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 sm:p-5 bg-stone-950/60 border-t border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Missing items one-click button */}
        {missingIngredients.length > 0 ? (
          <button
            onClick={() => onAddMissingToShoppingList(recipe)}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
            <span>Add {missingIngredients.length} Missing to List</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold px-2">
            <Check className="w-4 h-4" />
            <span>All items ready to cook!</span>
          </div>
        )}

        {/* Primary Launch Step-by-Step Cooking Mode */}
        <button
          onClick={() => onSelectRecipe(recipe)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
        >
          <Utensils className="w-4 h-4" />
          <span>Cook Step-by-Step</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
