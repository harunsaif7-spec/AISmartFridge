import React, { useState } from 'react';
import {
  ShoppingBag,
  Check,
  Trash2,
  Plus,
  Copy,
  CheckCheck,
  Sparkles,
  ArrowRight,
  ListFilter
} from 'lucide-react';
import { ShoppingItem } from '../utils/culinaryLogic';

interface ShoppingListTabProps {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  onNavigateToRecipes: () => void;
}

export const ShoppingListTab: React.FC<ShoppingListTabProps> = ({
  items,
  setItems,
  onNavigateToRecipes,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Grocery');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearChecked = () => {
    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const clearAll = () => {
    setItems([]);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: 'shop_' + Date.now(),
      name: newItemName.trim(),
      amount: newItemAmount.trim() || undefined,
      category: newItemCategory,
      checked: false,
      createdAt: Date.now(),
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemAmount('');
  };

  const handleCopyToClipboard = () => {
    if (items.length === 0) return;
    const text = items
      .map(
        (i) =>
          `${i.checked ? '[x]' : '[ ]'} ${i.name}${i.amount ? ` (${i.amount})` : ''}`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Pantry & Grocery';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900/80 border border-stone-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
                Culinary Shopping List
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                {uncheckedCount} items needed
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Missing ingredients added from recipe cards with one click.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-2">
          {items.length > 0 && (
            <>
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
              >
                {copiedNotice ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy List</span>
                  </>
                )}
              </button>

              {checkedCount > 0 && (
                <button
                  onClick={clearChecked}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs font-medium transition"
                >
                  Clear Done ({checkedCount})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Custom Item Input */}
      <form
        onSubmit={handleAddItem}
        className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          placeholder="Add custom item (e.g. Maldon flaky salt, Oat milk)..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-2 bg-stone-950 border border-stone-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 outline-none"
        />
        <input
          type="text"
          placeholder="Qty (e.g. 1 box, 2 lbs)"
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          className="w-full sm:w-36 bg-stone-950 border border-stone-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 outline-none"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          className="bg-stone-950 border border-stone-800 text-stone-300 rounded-xl px-3 py-2 text-xs outline-none"
        >
          <option value="Grocery">Grocery</option>
          <option value="Produce">Produce</option>
          <option value="Dairy & Eggs">Dairy & Eggs</option>
          <option value="Meat & Seafood">Meat & Seafood</option>
          <option value="Spices & Oils">Spices & Oils</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-stone-900/40 border border-stone-800/80 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center text-stone-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Your Shopping List is Empty</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Whenever a recipe requires an ingredient you don't have in your fridge,
              click "Add to Shopping List" on the recipe card or step guide.
            </p>
          </div>
          <button
            onClick={onNavigateToRecipes}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <span>Browse Suggested Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div
              key={category}
              className="rounded-3xl bg-stone-900/60 border border-stone-800 p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                <span>{category}</span>
                <span className="text-[11px] font-normal text-stone-400">
                  {catItems.filter((i) => !i.checked).length} needed
                </span>
              </div>

              <div className="divide-y divide-stone-800/60">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between group"
                  >
                    <div
                      onClick={() => toggleCheck(item.id)}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          item.checked
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-stone-600 group-hover:border-stone-400 bg-stone-950'
                        }`}
                      >
                        {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <span
                          className={`text-sm font-semibold transition-all ${
                            item.checked
                              ? 'line-through text-stone-400'
                              : 'text-stone-100 group-hover:text-emerald-300'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.amount && (
                          <span className="ml-2 text-xs text-stone-400 font-normal">
                            &bull; {item.amount}
                          </span>
                        )}
                        {item.addedFromRecipeTitle && (
                          <div className="text-[10px] text-stone-400 truncate">
                            For: {item.addedFromRecipeTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 opacity-60 group-hover:opacity-100 transition"
                      title="Delete item"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom Clear All Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={clearAll}
              className="text-xs text-stone-400 hover:text-rose-400 transition"
            >
              Clear Entire List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
