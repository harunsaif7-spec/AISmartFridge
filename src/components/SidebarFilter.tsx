import React from 'react';
import {
  Filter,
  RotateCcw,
  Clock,
  Flame,
  Gauge,
  Search,
  Check,
  CheckCircle2,
  Sparkles,
  Sliders,
  X
} from 'lucide-react';
import { FilterState } from '../utils/culinaryLogic';

interface SidebarFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const DIETARY_OPTIONS = [
  { id: 'Vegetarian', label: 'Vegetarian', color: 'emerald' },
  { id: 'Vegan', label: 'Vegan', color: 'green' },
  { id: 'Keto', label: 'Keto', color: 'indigo' },
  { id: 'Gluten-Free', label: 'Gluten-Free', color: 'amber' },
  { id: 'Dairy-Free', label: 'Dairy-Free', color: 'blue' },
  { id: 'Low-Carb', label: 'Low-Carb', color: 'purple' },
  { id: 'High-Protein', label: 'High-Protein', color: 'rose' },
  { id: 'Pescatarian', label: 'Pescatarian', color: 'cyan' },
];

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  filters,
  setFilters,
  totalMatches,
  isOpenMobile,
  onCloseMobile,
}) => {
  const toggleDietary = (tag: string) => {
    setFilters((prev) => {
      const exists = prev.dietary.includes(tag);
      return {
        ...prev,
        dietary: exists
          ? prev.dietary.filter((t) => t !== tag)
          : [...prev.dietary, tag],
      };
    });
  };

  const handleReset = () => {
    setFilters({
      dietary: [],
      difficulty: 'all',
      maxTime: 0,
      maxCalories: 0,
      search: '',
      onlyCookableNow: false,
    });
  };

  const hasActiveFilters =
    filters.dietary.length > 0 ||
    filters.difficulty !== 'all' ||
    filters.maxTime > 0 ||
    filters.maxCalories > 0 ||
    filters.search !== '' ||
    filters.onlyCookableNow;

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Filter Recipes</h3>
          <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 text-xs font-semibold">
            {totalMatches} shown
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs text-stone-400 hover:text-emerald-400 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
          Search Recipe or Food
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="e.g. Shakshuka, garlic, pasta..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 outline-none"
          />
        </div>
      </div>

      {/* Dietary Restrictions (Core requirement) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
            Dietary Restrictions
          </label>
          {filters.dietary.length > 0 && (
            <span className="text-[11px] text-emerald-400 font-medium">
              {filters.dietary.length} active
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DIETARY_OPTIONS.map((opt) => {
            const isSelected = filters.dietary.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleDietary(opt.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cookable Now Toggle */}
      <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ready-to-Cook Only</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            100% ingredients already in fridge
          </div>
        </div>
        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, onlyCookableNow: !prev.onlyCookableNow }))
          }
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            filters.onlyCookableNow ? 'bg-emerald-600' : 'bg-stone-800'
          }`}
          aria-label="Toggle Ready-to-Cook Only"
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 left-1 ${
              filters.onlyCookableNow ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Difficulty Rating */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
          Cooking Difficulty
        </label>
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-stone-950 border border-stone-800">
          {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setFilters((prev) => ({ ...prev, difficulty: diff }))}
              className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filters.difficulty === diff
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Max Time Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Max Total Time</span>
          </label>
          <span className="font-semibold text-emerald-400">
            {filters.maxTime === 0 ? 'Any Time' : `Under ${filters.maxTime} mins`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          step="10"
          value={filters.maxTime}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxTime: parseInt(e.target.value, 10) }))
          }
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 font-medium">
          <span>Any</span>
          <span>15m</span>
          <span>30m</span>
          <span>45m</span>
          <span>60m</span>
        </div>
      </div>

      {/* Max Calories Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Max Calories</span>
          </label>
          <span className="font-semibold text-rose-400">
            {filters.maxCalories === 0 ? 'Any Calories' : `< ${filters.maxCalories} kcal`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="800"
          step="100"
          value={filters.maxCalories}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxCalories: parseInt(e.target.value, 10) }))
          }
          className="w-full accent-rose-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 font-medium">
          <span>Any</span>
          <span>300</span>
          <span>500</span>
          <span>700+</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky) */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 rounded-3xl bg-stone-900/80 border border-stone-800 p-5 shadow-xl backdrop-blur-md">
          {content}
        </div>
      </aside>

      {/* Mobile Modal Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-sm bg-stone-900 h-full p-6 shadow-2xl overflow-y-auto z-10 border-l border-stone-800">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
              <span className="font-bold text-lg text-white">Filters</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="mt-6 pt-4 border-t border-stone-800">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition"
              >
                Apply & View ({totalMatches} recipes)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
