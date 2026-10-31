import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Eye, ShieldCheck, Box } from 'lucide-react';
import { Ingredient } from '../utils/culinaryLogic';

interface FridgeVisualizerProps {
  currentImage: string | null;
  detectedIngredients: Ingredient[];
  isLoading: boolean;
  onChangePhotoClick: () => void;
}

export const FridgeVisualizer: React.FC<FridgeVisualizerProps> = ({
  currentImage,
  detectedIngredients,
  isLoading,
  onChangePhotoClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // If user uploaded a real camera image (base64 starting with data:image/(jpeg|png|webp)) and not SVG
  const isRealPhoto = currentImage && !currentImage.includes('image/svg');

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl select-none group">
      {isRealPhoto ? (
        <img
          src={currentImage}
          alt="Fridge interior"
          className="w-full h-full object-cover object-center"
        />
      ) : (
        /* Stylized Interactive Smart Fridge Interior */
        <div className="relative w-full h-full bg-gradient-to-b from-stone-950 via-slate-900 to-stone-950 overflow-hidden">
          {/* Top LED Lighting Bar with ambient kitchen glow */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-sky-400/20 via-sky-400/5 to-transparent pointer-events-none" />
          <div className="absolute top-2 left-8 right-8 h-1.5 rounded-full bg-sky-200/90 shadow-[0_0_20px_rgba(56,189,248,0.8)]" />

          {/* Fridge Shelves (Glass & Chrome) */}
          {/* Shelf 1 (Upper Dairy & Jars) */}
          <div className="absolute top-[30%] left-4 right-4 h-2.5 rounded-sm bg-gradient-to-r from-sky-500/20 via-white/40 to-sky-500/20 border-b border-sky-400/40 shadow-sm" />
          {/* Shelf 2 (Middle Produce & Deli) */}
          <div className="absolute top-[60%] left-4 right-4 h-2.5 rounded-sm bg-gradient-to-r from-sky-500/20 via-white/40 to-sky-500/20 border-b border-sky-400/40 shadow-sm" />
          {/* Shelf 3 (Lower Crisper Cover) */}
          <div className="absolute top-[82%] left-4 right-4 h-3 rounded-md bg-stone-800/80 border-t border-sky-400/30" />

          {/* Interactive AI Detection Bounding Boxes */}
          {/* Top Shelf Items */}
          <div
            onMouseEnter={() => setHoveredItem('Eggs')}
            onMouseLeave={() => setHoveredItem(null)}
            className="absolute top-[12%] left-[10%] w-24 h-16 rounded-xl border border-dashed border-emerald-400/60 bg-emerald-500/10 hover:bg-emerald-500/25 transition cursor-pointer p-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[9px] font-bold text-emerald-300">
              <span className="bg-stone-900/90 px-1.5 py-0.5 rounded">Eggs (6)</span>
              <span>98%</span>
            </div>
            <div className="flex space-x-1 justify-center">
              <span className="w-4 h-4 rounded-full bg-amber-300/80 inline-block shadow-xs" />
              <span className="w-4 h-4 rounded-full bg-amber-300/80 inline-block shadow-xs" />
              <span className="w-4 h-4 rounded-full bg-amber-300/80 inline-block shadow-xs" />
            </div>
          </div>

          <div
            onMouseEnter={() => setHoveredItem('Greek Yogurt')}
            onMouseLeave={() => setHoveredItem(null)}
            className="absolute top-[10%] left-[38%] w-18 h-18 rounded-xl border border-dashed border-teal-400/60 bg-teal-500/10 hover:bg-teal-500/25 transition cursor-pointer p-1.5 flex flex-col justify-between"
          >
            <div className="text-[9px] font-bold text-teal-300 bg-stone-900/90 px-1 py-0.5 rounded text-center">
              Yogurt
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100/90 mx-auto border border-amber-200/50 flex items-center justify-center text-[8px] font-bold text-amber-900">
              32oz
            </div>
          </div>

          <div
            onMouseEnter={() => setHoveredItem('Greek Feta Cheese')}
            onMouseLeave={() => setHoveredItem(null)}
            className="absolute top-[14%] left-[62%] w-24 h-14 rounded-xl border border-dashed border-sky-400/60 bg-sky-500/10 hover:bg-sky-500/25 transition cursor-pointer p-1.5 flex flex-col justify-between"
          >
            <div className="text-[9px] font-bold text-sky-300 bg-stone-900/90 px-1.5 py-0.5 rounded truncate">
              Feta Block
            </div>
            <div className="w-14 h-5 rounded bg-amber-50/90 mx-auto border border-stone-300 text-stone-700 text-[8px] font-bold flex items-center justify-center">
              BRINE 200g
            </div>
          </div>

          {/* Middle Shelf Items */}
          <div
            onMouseEnter={() => setHoveredItem('Baby Spinach')}
            onMouseLeave={() => setHoveredItem(null)}
            className="absolute top-[40%] left-[12%] w-36 h-20 rounded-2xl border border-dashed border-emerald-400/70 bg-emerald-500/15 hover:bg-emerald-500/30 transition cursor-pointer p-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-300">
              <span className="bg-stone-900/90 px-1.5 py-0.5 rounded">Baby Spinach</span>
              <span className="text-amber-300">Use Soon</span>
            </div>
            <div className="h-7 rounded-lg bg-emerald-600/40 border border-emerald-400/40 flex items-center justify-center text-[9px] text-emerald-200 font-medium">
              Crisper Box (5 oz)
            </div>
          </div>

          <div
            onMouseEnter={() => setHoveredItem('Cherry Tomatoes')}
            onMouseLeave={() => setHoveredItem(null)}
            className="absolute top-[42%] left-[55%] w-28 h-18 rounded-2xl border border-dashed border-rose-400/70 bg-rose-500/15 hover:bg-rose-500/30 transition cursor-pointer p-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-rose-300">
              <span className="bg-stone-900/90 px-1.5 py-0.5 rounded truncate">Tomatoes</span>
              <span>1 Pint</span>
            </div>
            <div className="flex space-x-1.5 justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm" />
            </div>
          </div>

          {/* Lower Crisper Bins */}
          <div className="absolute bottom-[3%] left-[8%] w-[40%] h-[13%] rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-300 font-bold tracking-wide">
            VEGETABLES & HERBS
          </div>

          <div className="absolute bottom-[3%] right-[8%] w-[40%] h-[13%] rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-center text-[10px] text-sky-300 font-bold tracking-wide">
            DAIRY & DELI
          </div>

          {/* AI Scan Beam Effect */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-[bounce_4s_infinite] pointer-events-none opacity-70" />
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-16 h-16 relative mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <Sparkles className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-bold text-lg">AI Inspecting Fridge Contents...</h4>
            <p className="text-stone-400 text-xs max-w-xs">
              Detecting produce, cartons, and pantry items with Gemini Vision.
            </p>
          </div>
          <div className="w-48 h-1.5 bg-stone-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-[pulse_1.5s_ease-in-out_infinite] w-3/4" />
          </div>
        </div>
      )}

      {/* Bottom Status Bar overlay */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-stone-700/70 shadow-lg z-10">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-stone-200">
              Fridge Analyzed &bull; {detectedIngredients.length} Items Detected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onChangePhotoClick}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition"
            >
              Change Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
