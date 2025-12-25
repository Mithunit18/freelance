"use client";

import { motion } from 'framer-motion';
import { IndianRupee } from 'lucide-react';
import { useWizardStore, BudgetRange } from "@/stores/WizardStore";
import { cn } from "@vision-match/utils-js";

const budgets: { type: BudgetRange; label: string; range: string; description: string }[] = [
  {
    type: 'economy',
    label: 'Economy',
    range: '₹10K - ₹25K',
    description: 'Perfect for small projects and personal events',
  },
  {
    type: 'standard',
    label: 'Standard',
    range: '₹25K - ₹75K',
    description: 'Great for most events with professional coverage',
  },
  {
    type: 'premium',
    label: 'Premium',
    range: '₹75K - ₹2L',
    description: 'Top-tier talent for important occasions',
  },
  {
    type: 'luxury',
    label: 'Luxury',
    range: '₹2L+',
    description: 'Elite creators for exclusive high-end projects',
  },
];

export function BudgetStep() {
  const { budget, setBudget } = useWizardStore();

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        What's your budget?
      </h2>
      <p className="text-muted-foreground mb-8">
        This helps us find creators within your price range.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {budgets.map((b, index) => (
          <motion.button
            key={b.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setBudget(b.type)}
            className={cn(
              "p-6 rounded-xl border-2 transition-all text-left",
              budget === b.type
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-secondary"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">{b.label}</h3>
              <div
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                  budget === b.type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <IndianRupee className="h-3 w-3" />
                {b.range.replace('₹', '')}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{b.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
