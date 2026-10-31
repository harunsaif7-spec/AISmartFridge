import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ShoppingBag,
  Plus,
  Check,
  X,
  ChefHat,
  Bell
} from 'lucide-react';
import { Recipe, RecipeStep, parseStepTimer } from '../utils/culinaryLogic';

interface StepByStepModalProps {
  recipe: Recipe;
  onClose: () => void;
  onAddIngredientToShoppingList: (name: string, amount: string, recipeTitle: string) => void;
  shoppingListNames: string[];
}

// Audio chime using Web Audio API for timer expiration
function playTimerChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(587.33, 0, 0.4); // D5
    playTone(880, 0.2, 0.6);   // A5
    playTone(1174.66, 0.4, 0.8); // D6
  } catch (e) {
    console.warn('Audio chime could not play:', e);
  }
}

export const StepByStepModal: React.FC<StepByStepModalProps> = ({
  recipe,
  onClose,
  onAddIngredientToShoppingList,
  shoppingListNames,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [autoReadNext, setAutoReadNext] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step Timer State
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentStep: RecipeStep = recipe.steps[currentStepIndex] || {
    stepNumber: currentStepIndex + 1,
    instruction: 'Complete!',
  };

  // Check if step specifies a cooking duration
  const detectedStepMinutes = currentStep.timeInMinutes || parseStepTimer(currentStep.instruction);

  // Initialize timer for current step when step changes
  useEffect(() => {
    if (detectedStepMinutes && detectedStepMinutes > 0) {
      setTimerSecondsLeft(detectedStepMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
    }

    if (autoReadNext) {
      speakStepText(currentStep.instruction, currentStep.tip);
    } else {
      stopSpeaking();
    }

    return () => {
      stopSpeaking();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentStepIndex]);

  // Timer countdown handler
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            playTimerChime();
            speakStepText("Timer finished! Please check your food.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  // Read Aloud / Text-to-Speech logic
  const speakStepText = (text: string, tip?: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const fullSpeech = `Step ${currentStepIndex + 1}. ${text} ${tip ? `Chef tip: ${tip}` : ''}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakStepText(currentStep.instruction, currentStep.tip);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCompletedSteps((prev) =>
        prev.includes(currentStepIndex) ? prev : [...prev, currentStepIndex]
      );
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleStepCompleted = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Keyboard navigation for hands-free or quick controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevStep();
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        toggleSpeech();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, isSpeaking]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Format timer seconds into mm:ss
  const formatTimerDigits = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(
    ((currentStepIndex + 1) / recipe.steps.length) * 100
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-stone-950 flex flex-col overflow-y-auto text-white selection:bg-emerald-500/30"
    >
      {/* Top Hands-Free Command Bar */}
      <div className="sticky top-0 z-20 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit Cooking</span>
          </button>

          <div className="hidden sm:block border-l border-stone-800 pl-3">
            <h2 className="font-extrabold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
              {recipe.title}
            </h2>
            <div className="text-[11px] text-emerald-400 font-medium">
              Kitchen Display Mode &bull; Large High-Contrast View
            </div>
          </div>
        </div>

        {/* Speech & Audio Controls (Core requirement) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Read Aloud Button */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
              isSpeaking
                ? 'bg-emerald-500 text-stone-950 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-500/30'
            }`}
            aria-label={isSpeaking ? 'Stop Read Aloud' : 'Read Aloud Current Step'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Pause Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Read Step Aloud</span>
              </>
            )}
          </button>

          {/* Auto Read Next Toggle */}
          <button
            onClick={() => setAutoReadNext(!autoReadNext)}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
              autoReadNext
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-stone-800/80 border-stone-700 text-stone-400'
            }`}
            title="Automatically read aloud when advancing steps"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auto-Speak Steps</span>
          </button>

          {/* Speech Rate Cycle */}
          <button
            onClick={() => {
              const rates = [0.8, 1.0, 1.2];
              const next = rates[(rates.indexOf(speechRate) + 1) % rates.length];
              setSpeechRate(next);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800 text-[11px] text-stone-300 font-mono hover:text-white"
            title="Adjust Speech Speed"
          >
            {speechRate}x
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title="Toggle Kitchen Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-800 h-1.5">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Content Main Canvas */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-between space-y-8">
        {/* Step Badge & Speaking Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-stone-950 text-sm sm:text-base font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                Step {currentStepIndex + 1} of {recipe.steps.length}
              </span>
              <span className="text-stone-400 text-xs sm:text-sm font-semibold">
                {progressPercent}% Complete
              </span>
            </div>

            {isSpeaking && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Reading Aloud Hands-Free</span>
              </div>
            )}
          </div>

          {/* Large High-Contrast Step Text for Kitchen Reading (3-5 feet distance) */}
          <div className="p-6 sm:p-10 rounded-3xl bg-stone-900 border-2 border-stone-800 shadow-2xl">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-50 leading-relaxed tracking-tight font-['Plus_Jakarta_Sans']">
              {currentStep.instruction}
            </p>

            {/* Chef Tip Callout */}
            {currentStep.tip && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5 text-amber-200">
                <ChefHat className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm sm:text-base leading-relaxed">
                  <span className="font-bold text-amber-300">Chef's Secret: </span>
                  {currentStep.tip}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step Ingredients & Integrated Kitchen Timer Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Needed Ingredients for this Step */}
          <div className="md:col-span-7 p-5 rounded-3xl bg-stone-900/70 border border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Ingredients Needed for This Step
              </span>
              <span className="text-xs text-stone-400">Tap to add missing</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ing, idx) => {
                const isHighlighted =
                  currentStep.highlightIngredients?.some((h) =>
                    ing.name.toLowerCase().includes(h.toLowerCase())
                  ) ||
                  currentStep.instruction.toLowerCase().includes(ing.name.toLowerCase());

                const isAlreadyInCart = shoppingListNames.some(
                  (n) => n.toLowerCase().trim() === ing.name.toLowerCase().trim()
                );

                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm border transition ${
                      isHighlighted
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200 font-bold shadow-md'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400'
                    }`}
                  >
                    <span>{ing.name}</span>
                    <span className="text-xs text-stone-400">({ing.amount})</span>
                    {!ing.isAvailable && (
                      <button
                        onClick={() =>
                          onAddIngredientToShoppingList(ing.name, ing.amount, recipe.title)
                        }
                        className="ml-1 p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-stone-800 transition"
                        title="Add missing to Shopping List"
                        aria-label={`Add ${ing.name} to Shopping List`}
                      >
                        {isAlreadyInCart ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Kitchen Countdown Timer */}
          <div className="md:col-span-5 p-5 rounded-3xl bg-stone-900/70 border border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Step Timer</span>
              </div>
              {timerSecondsLeft !== null && timerSecondsLeft === 0 && (
                <span className="flex items-center space-x-1 text-xs text-rose-400 font-extrabold animate-bounce">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Time is Up!</span>
                </span>
              )}
            </div>

            {timerSecondsLeft !== null ? (
              <div className="flex items-center justify-between py-2">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-wider">
                  {formatTimerDigits(timerSecondsLeft)}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      isTimerRunning
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSecondsLeft(
                        detectedStepMinutes ? detectedStepMinutes * 60 : 300
                      );
                    }}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                    title="Reset Timer"
                    aria-label="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-2 flex items-center justify-between">
                <span className="text-xs text-stone-400">No duration set for this step</span>
                <button
                  onClick={() => {
                    setTimerSecondsLeft(300); // 5 mins default
                    setIsTimerRunning(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-emerald-400"
                >
                  + Quick 5m Timer
                </button>
              </div>
            )}

            {/* Quick Time Adders */}
            {timerSecondsLeft !== null && (
              <div className="flex items-center space-x-1.5 mt-2 pt-2 border-t border-stone-800">
                <span className="text-[10px] text-stone-400">Add time:</span>
                <button
                  onClick={() => setTimerSecondsLeft((prev) => (prev || 0) + 60)}
                  className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300"
                >
                  +1 min
                </button>
                <button
                  onClick={() => setTimerSecondsLeft((prev) => (prev || 0) + 300)}
                  className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300"
                >
                  +5 min
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Big Large Buttons Navigation Bar */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-4">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-2 px-6 py-4 rounded-2xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 font-bold text-sm sm:text-base transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous Step</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1 text-xs text-stone-400">
            <span>Tip: Press</span>
            <kbd className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
              Space
            </kbd>
            <span>to Read Aloud,</span>
            <kbd className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
              &rarr;
            </kbd>
            <span>for Next</span>
          </div>

          {currentStepIndex < recipe.steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-base sm:text-lg shadow-xl shadow-emerald-950/50 transition active:scale-95 cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-stone-950 font-extrabold text-base sm:text-lg shadow-xl transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Dish Finished! Bon Appétit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
