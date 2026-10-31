import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  ArrowRight,
  Video,
  X
} from 'lucide-react';
import { Ingredient } from '../utils/culinaryLogic';
import { PRESET_FRIDGES, PresetFridge } from '../data/presetFridges';
import { FridgeVisualizer } from './FridgeVisualizer';

interface FridgeScannerProps {
  detectedIngredients: Ingredient[];
  setDetectedIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  currentImage: string | null;
  setCurrentImage: (url: string | null) => void;
  onAnalyzeImage: (base64: string) => Promise<void>;
  isLoading: boolean;
  onNavigateToRecipes: () => void;
  recipeCount: number;
}

export const FridgeScanner: React.FC<FridgeScannerProps> = ({
  detectedIngredients,
  setDetectedIngredients,
  currentImage,
  setCurrentImage,
  onAnalyzeImage,
  isLoading,
  onNavigateToRecipes,
  recipeCount,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientCategory, setNewIngredientCategory] = useState('Produce');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('mediterranean-fresh');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload a photo instead.');
      setCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      handleStopCamera();
      setCurrentImage(dataUrl);
      setSelectedPresetId(null);
      onAnalyzeImage(dataUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCurrentImage(base64);
        setSelectedPresetId(null);
        onAnalyzeImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: PresetFridge) => {
    setSelectedPresetId(preset.id);
    setCurrentImage(preset.image);
    setDetectedIngredients(preset.ingredients);
  };

  const handleAddCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;

    const newIng: Ingredient = {
      id: 'ing_user_' + Date.now(),
      name: newIngredientName.trim(),
      category: newIngredientCategory,
      freshness: 'fresh',
      confidence: 1.0,
      amount: 'Added manually',
    };

    setDetectedIngredients((prev) => [newIng, ...prev]);
    setNewIngredientName('');
  };

  const handleRemoveIngredient = (id: string) => {
    setDetectedIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const categories = [
    'Produce',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Condiments',
    'Bakery',
    'Pantry & Grains',
    'Beverages',
    'Other',
  ];

  // Group detected ingredients by category
  const grouped = detectedIngredients.reduce((acc, ing) => {
    const cat = ing.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="space-y-8">
      {/* Hero Intro Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 4 Argon & 3.8 Flash Vision Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Snap Your Open Fridge, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Cook Gourmet Dishes Instantly.
              </span>
            </h1>
            <p className="mt-2 text-stone-300 text-sm sm:text-base leading-relaxed">
              Our culinary vision model identifies veggies, dairy, condiments, and proteins on your shelves,
              then designs tailored recipes so nothing spoils and you never have to ask "what's for dinner?".
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Fridge Photo</span>
            </button>

            <button
              onClick={handleStartCamera}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Take Photo</span>
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      </div>

      {/* Camera Live Modal if opened */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-stone-900 rounded-3xl overflow-hidden border border-stone-700 shadow-2xl">
            <div className="p-4 bg-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-sm">Live Fridge Viewfinder</span>
              </div>
              <button
                onClick={handleStopCamera}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-700 transition"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center min-h-[350px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-[500px] object-contain"
              />
              {/* Target Reticle */}
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="bg-stone-900/80 px-4 py-1.5 rounded-full text-xs text-emerald-300 font-medium backdrop-blur-sm">
                  Align shelves and ingredients in frame
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-800 flex items-center justify-center space-x-4">
              <button
                onClick={handleCaptureFromCamera}
                className="flex items-center space-x-2 px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-base shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Capture & Analyze</span>
              </button>
              <button
                onClick={handleStopCamera}
                className="px-5 py-3 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Grid: Upload / Visualizer on Left, Detected Ingredients on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photo & Scan Zone */}
        <div className="lg:col-span-6 space-y-6">
          {/* Upload Drop Zone / Active Photo Preview */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-3xl overflow-hidden border-2 transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-950/20 shadow-xl shadow-emerald-500/10'
                : 'border-stone-800 bg-stone-900/70'
            }`}
          >
            {currentImage ? (
              <FridgeVisualizer
                currentImage={currentImage}
                detectedIngredients={detectedIngredients}
                isLoading={isLoading}
                onChangePhotoClick={() => fileInputRef.current?.click()}
              />
            ) : (
              /* Empty Drop Zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer py-16 px-6 text-center flex flex-col items-center justify-center space-y-4 hover:bg-stone-850/50 transition"
              >
                <div className="w-20 h-20 rounded-3xl bg-stone-800 border border-stone-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                  <Camera className="w-9 h-9 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">Snap or Upload Open Fridge Photo</h3>
                  <p className="text-stone-400 text-xs max-w-xs mx-auto">
                    Drag and drop any fridge image here, or tap to choose a photo from your camera roll.
                  </p>
                </div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Supports JPG, PNG, WEBP</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Or Try Sample Fridge Scans:
              </span>
              <span className="text-xs text-stone-400">1-click test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESET_FRIDGES.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-emerald-300 border border-stone-700">
                        {preset.badge.split('•')[0].trim()}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="font-bold text-xs text-white truncate">{preset.name}</div>
                    <div className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                      {preset.ingredients.map((i) => i.name).slice(0, 3).join(', ')}...
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detected Ingredients Manager */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-stone-900/70 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                    Detected Ingredients
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {detectedIngredients.length} items
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Review what AI spotted. You can remove or add missed items.
                </p>
              </div>

              {recipeCount > 0 && (
                <button
                  onClick={onNavigateToRecipes}
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 font-bold text-xs shadow-md transition active:scale-95"
                >
                  <span>View Recipes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Add Custom Ingredient Form */}
            <form onSubmit={handleAddCustomIngredient} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="+ Add missed item (e.g., Dijon Mustard, Milk)"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 outline-none transition"
              />
              <select
                value={newIngredientCategory}
                onChange={(e) => setNewIngredientCategory(e.target.value)}
                className="bg-stone-950 border border-stone-800 text-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 cursor-pointer"
                title="Add Ingredient"
                aria-label="Add Ingredient"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Grouped Ingredients List */}
            <div className="mt-5 space-y-5 max-h-[380px] overflow-y-auto pr-1">
              {detectedIngredients.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  No ingredients detected yet. Snap or upload your fridge photo above!
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                      <span>{category}</span>
                      <span className="text-[11px] font-normal text-stone-400">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((ing) => (
                        <div
                          key={ing.id}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 hover:border-stone-700 transition"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-semibold text-stone-200 truncate flex items-center space-x-1.5">
                              <span>{ing.name}</span>
                              {ing.freshness === 'use-soon' && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                  Use Soon
                                </span>
                              )}
                            </div>
                            {ing.amount && (
                              <div className="text-[11px] text-stone-400 truncate">
                                {ing.amount}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemoveIngredient(ing.id)}
                            className="text-stone-500 hover:text-rose-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                            title={`Remove ${ing.name}`}
                            aria-label={`Remove ${ing.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-auto pt-5 border-t border-stone-800 flex items-center justify-between">
              <div className="text-xs text-stone-400">
                Ready to turn these {detectedIngredients.length} items into meals?
              </div>

              <button
                onClick={onNavigateToRecipes}
                disabled={detectedIngredients.length === 0}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
              >
                <span>Find Recipes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
