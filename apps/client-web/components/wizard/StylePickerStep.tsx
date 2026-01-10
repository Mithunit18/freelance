"use client";

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useWizardStore } from "@/stores/WizardStore"
import { cn } from "@vision-match/utils-js";

// Mock style images - in production these would come from your API
const styleImages = [
  { id: 'moody-dark', label: 'Moody & Dark', color: 'from-slate-700 to-zinc-600', emoji: '🌙' },
  { id: 'bright-airy', label: 'Bright & Airy', color: 'from-amber-200 to-orange-200', emoji: '☀️' },
  { id: 'cinematic', label: 'Cinematic', color: 'from-blue-700 to-slate-700', emoji: '🎬' },
  { id: 'documentary', label: 'Documentary', color: 'from-stone-500 to-stone-400', emoji: '📷' },
  { id: 'editorial', label: 'Editorial', color: 'from-neutral-300 to-neutral-400', emoji: '📰' },
  { id: 'vibrant', label: 'Vibrant', color: 'from-pink-500 to-orange-400', emoji: '🎨' },
  { id: 'classic', label: 'Classic', color: 'from-amber-600 to-yellow-500', emoji: '✨' },
  { id: 'minimal', label: 'Minimal', color: 'from-gray-200 to-gray-300', emoji: '🤍' },
  { id: 'artistic', label: 'Artistic', color: 'from-purple-500 to-pink-500', emoji: '🎭' },
];

export function StylePickerStep() {
  const { selectedStyles, toggleStyle } = useWizardStore();

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 8 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          What's your style?
        </h2>
        <p className="text-gray-500 mb-2">
          Select at least 3 styles that resonate with your vision.
        </p>
        
        {/* Progress indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: selectedStyles.length >= i ? 1 : 0.8,
                  backgroundColor: selectedStyles.length >= i ? '#ec4899' : '#d1d5db'
                }}
                className="w-2.5 h-2.5 rounded-full"
              />
            ))}
          </div>
          <span className={cn(
            "text-sm font-medium transition-colors",
            selectedStyles.length >= 3 ? "text-pink-500" : "text-gray-500"
          )}>
            {selectedStyles.length >= 3 ? '✓ Ready!' : `${selectedStyles.length}/3 minimum`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {styleImages.map((style, index) => {
          const isSelected = selectedStyles.includes(style.id);
          return (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleStyle(style.id)}
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group",
                isSelected
                  ? "border-pink-500 ring-2 ring-pink-500/30 ring-offset-2 ring-offset-white shadow-lg shadow-pink-500/20"
                  : "border-gray-200 hover:border-pink-300"
              )}
            >
              {/* Gradient placeholder for style image */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-all duration-300",
                  style.color,
                  isSelected && "brightness-110"
                )}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              
              {/* Emoji indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: isSelected ? 0 : 1, 
                  scale: isSelected ? 0 : 1 
                }}
                className="absolute top-2 left-2 text-2xl opacity-80"
              >
                {style.emoji}
              </motion.div>
              
              {/* Label */}
              <div className="absolute inset-0 flex items-end p-2 sm:p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-lg">
                  {style.label}
                </span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-2 right-2 w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              )}

              {/* Animated border on selection */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Selected styles summary */}
      {selectedStyles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
          <p className="text-sm text-gray-500 mb-2">Selected styles:</p>
          <div className="flex flex-wrap gap-2">
            {selectedStyles.map((styleId) => {
              const style = styleImages.find(s => s.id === styleId);
              return (
                <motion.span
                  key={styleId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 text-sm text-gray-700"
                >
                  {style?.emoji} {style?.label}
                </motion.span>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
