"use client";

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useWizardStore } from "@/stores/WizardStore"
import { cn } from "@vision-match/utils-js";

// Mock style images - in production these would come from your API
const styleImages = [
  { id: 'moody-dark', label: 'Moody & Dark', color: 'from-slate-900 to-zinc-800' },
  { id: 'bright-airy', label: 'Bright & Airy', color: 'from-amber-100 to-orange-100' },
  { id: 'cinematic', label: 'Cinematic', color: 'from-blue-900 to-slate-800' },
  { id: 'documentary', label: 'Documentary', color: 'from-stone-600 to-stone-400' },
  { id: 'editorial', label: 'Editorial', color: 'from-neutral-200 to-neutral-400' },
  { id: 'vibrant', label: 'Vibrant', color: 'from-pink-500 to-orange-400' },
  { id: 'classic', label: 'Classic', color: 'from-amber-700 to-yellow-600' },
  { id: 'minimal', label: 'Minimal', color: 'from-gray-100 to-gray-300' },
  { id: 'artistic', label: 'Artistic', color: 'from-purple-600 to-pink-500' },
];

export function StylePickerStep() {
  const { selectedStyles, toggleStyle } = useWizardStore();

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        What's your style?
      </h2>
      <p className="text-muted-foreground mb-2">
        Select at least 3 styles that resonate with your vision.
      </p>
      <p className="text-sm text-primary mb-8">
        {selectedStyles.length}/3 minimum selected
      </p>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {styleImages.map((style, index) => {
          const isSelected = selectedStyles.includes(style.id);
          return (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => toggleStyle(style.id)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group",
                isSelected
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Gradient placeholder for style image */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br",
                  style.color
                )}
              />
              
              {/* Label */}
              <div className="absolute inset-0 flex items-end p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
                <span className="text-xs sm:text-sm font-medium text-white">
                  {style.label}
                </span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-primary-foreground" />
                </motion.div>
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
