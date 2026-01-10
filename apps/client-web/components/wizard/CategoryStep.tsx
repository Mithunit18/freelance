"use client";

import { motion } from 'framer-motion';
import { Heart, Briefcase, User, Package, PartyPopper, Building, Sparkles, Check } from 'lucide-react';
import { useWizardStore, EventCategory } from '../../stores/WizardStore';
import { cn } from "@vision-match/utils-js";

const categories: { type: EventCategory; icon: typeof Heart; label: string; gradient: string; description: string }[] = [
  { type: 'wedding', icon: Heart, label: 'Wedding', gradient: 'from-pink-500 to-rose-500', description: 'Capture your special day' },
  { type: 'corporate', icon: Briefcase, label: 'Corporate', gradient: 'from-blue-500 to-indigo-500', description: 'Professional business events' },
  { type: 'portrait', icon: User, label: 'Portrait', gradient: 'from-purple-500 to-pink-500', description: 'Personal & family photos' },
  { type: 'product', icon: Package, label: 'Product', gradient: 'from-pink-400 to-purple-500', description: 'E-commerce & catalog' },
  { type: 'event', icon: PartyPopper, label: 'Event', gradient: 'from-purple-500 to-blue-500', description: 'Parties & celebrations' },
  { type: 'real-estate', icon: Building, label: 'Real Estate', gradient: 'from-blue-500 to-purple-500', description: 'Property & architecture' },
];

export function CategoryStep() {
  const { category, setCategory } = useWizardStore();

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 2 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          What type of project?
        </h2>
        <p className="text-gray-500">
          This helps us match you with specialists in your category.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCategory(cat.type)}
            className={cn(
              "relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group overflow-hidden",
              category === cat.type
                ? "border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-500/10"
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
            )}
          >
            {/* Selection indicator */}
            {category === cat.type && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
              >
                <Check className="h-3 w-3 text-white" />
              </motion.div>
            )}
            
            {/* Icon container */}
            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                category === cat.type
                  ? `bg-gradient-to-br ${cat.gradient} shadow-lg`
                  : "bg-gray-100 group-hover:bg-gray-200"
              )}
            >
              <cat.icon
                className={cn(
                  "h-7 w-7 transition-all duration-300",
                  category === cat.type ? "text-white" : "text-gray-500 group-hover:text-pink-500 group-hover:scale-110"
                )}
              />
            </div>
            
            <div className="text-center">
              <span
                className={cn(
                  "font-semibold text-sm transition-colors block",
                  category === cat.type ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                )}
              >
                {cat.label}
              </span>
              <span className={cn(
                "text-xs transition-colors mt-1 block",
                category === cat.type ? "text-gray-600" : "text-gray-500 group-hover:text-gray-600"
              )}>
                {cat.description}
              </span>
            </div>
            
            {/* Hover glow */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br rounded-2xl",
              cat.gradient
            )} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
