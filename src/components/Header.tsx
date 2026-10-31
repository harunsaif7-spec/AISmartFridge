import React from 'react';
import { ChefHat, ShoppingBag, Sparkles, Camera, UtensilsCrossed } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scanner' | 'recipes' | 'shopping';
  setActiveTab: (tab: 'scanner' | 'recipes' | 'shopping') => void;
  detectedCount: number;
  recipeCount: number;
  shoppingCount: number;
  onQuickUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  detectedCount,
  recipeCount,
  shoppingCount,
  onQuickUploadClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('scanner')}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-[2px] shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-stone-900 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Culinary<span className="text-emerald-400">Lens</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  AI Smart Fridge
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden lg:block">
                Snap open fridge &bull; AI vision &bull; Hands-free cooking assistant
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-stone-800 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
              aria-label="Fridge Scanner Tab"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="hidden xs:inline">Fridge</span>
              {detectedCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] sm:text-xs rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {detectedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'recipes'
                  ? 'bg-stone-800 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
              aria-label="Recipe Suggestions Tab"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span className="hidden xs:inline">Recipes</span>
              {recipeCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] sm:text-xs rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  {recipeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'shopping'
                  ? 'bg-stone-800 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
              aria-label="Shopping List Tab"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              <span className="hidden xs:inline">Shopping</span>
              {shoppingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] sm:text-xs rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {shoppingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action Button */}
          <div className="hidden md:flex items-center space-x-2 shrink-0">
            <button
              onClick={onQuickUploadClick}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Scan Fridge</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
