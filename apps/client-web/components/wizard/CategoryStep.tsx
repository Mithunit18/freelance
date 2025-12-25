"use client";

import { motion } from 'framer-motion';
import { Heart, Briefcase, User, Package, PartyPopper, Building } from 'lucide-react';
import { useWizardStore, EventCategory } from '../../stores/WizardStore';
import { cn } from "@vision-match/utils-js";

const categories: { type: EventCategory; icon: typeof Heart; label: string }[] = [
  { type: 'wedding', icon: Heart, label: 'Wedding' },
  { type: 'corporate', icon: Briefcase, label: 'Corporate' },
  { type: 'portrait', icon: User, label: 'Portrait' },
  { type: 'product', icon: Package, label: 'Product' },
  { type: 'event', icon: PartyPopper, label: 'Event' },
  { type: 'real-estate', icon: Building, label: 'Real Estate' },
];

export function CategoryStep() {
  const { category, setCategory } = useWizardStore();

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        What type of project?
      </h2>
      <p className="text-muted-foreground mb-8">
        This helps us match you with specialists in your category.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setCategory(cat.type)}
            className={cn(
              "p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
              category === cat.type
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-secondary"
            )}
          >
            <cat.icon
              className={cn(
                "h-8 w-8 transition-colors",
                category === cat.type ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "font-medium transition-colors",
                category === cat.type ? "text-primary" : "text-foreground"
              )}
            >
              {cat.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
