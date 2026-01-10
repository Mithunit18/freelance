"use client";

import { motion } from 'framer-motion';
import { IndianRupee, Sparkles, Check, TrendingUp } from 'lucide-react';
import { useWizardStore, BudgetRange } from "@/stores/WizardStore";
import { cn } from "@vision-match/utils-js";

const budgets: { type: BudgetRange; label: string; range: string; description: string; gradient: string; popular?: boolean }[] = [
  {
    type: 'economy',
    label: 'Economy',
    range: '₹10K - ₹25K',
    description: 'Perfect for small projects and personal events',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    type: 'standard',
    label: 'Standard',
    range: '₹25K - ₹75K',
    description: 'Great for most events with professional coverage',
    gradient: 'from-purple-500 to-indigo-500',
    popular: true,
  },
  {
    type: 'premium',
    label: 'Premium',
    range: '₹75K - ₹2L',
    description: 'Top-tier talent for important occasions',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    type: 'luxury',
    label: 'Luxury',
    range: '₹2L+',
    description: 'Elite creators for exclusive high-end projects',
    gradient: 'from-pink-500 via-purple-500 to-blue-500',
  },
];

export function BudgetStep() {
  const { budget, setBudget } = useWizardStore();

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 7 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          What's your budget?
        </h2>
        <p className="text-gray-500">
          This helps us find creators within your price range.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {budgets.map((b, index) => (
          <motion.button
            key={b.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBudget(b.type)}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all text-left group overflow-hidden",
              budget === b.type
                ? "border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-500/10"
                : "border-gray-200 hover:border-pink-300 bg-white hover:bg-pink-50/30"
            )}
          >
            {/* Popular badge */}
            {b.popular && (
              <div className="absolute -top-px -right-px">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Popular
                </div>
              </div>
            )}
            
            {/* Selection indicator */}
            {budget === b.type && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    budget === b.type
                      ? `bg-gradient-to-br ${b.gradient} shadow-lg`
                      : "bg-gray-100 group-hover:bg-pink-100"
                  )}>
                    <IndianRupee className={cn(
                      "h-5 w-5 transition-colors",
                      budget === b.type ? "text-white" : "text-gray-500 group-hover:text-pink-500"
                    )} />
                  </div>
                  <h3 className={cn(
                    "font-semibold text-lg transition-colors",
                    budget === b.type ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                  )}>
                    {b.label}
                  </h3>
                </div>
                
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-bold transition-all",
                    budget === b.type
                      ? `bg-gradient-to-r ${b.gradient} text-white shadow-lg`
                      : "bg-gray-100 text-gray-600 group-hover:bg-pink-100"
                  )}
                >
                  {b.range.replace('₹', '')}
                </div>
              </div>
              
              <p className={cn(
                "text-sm transition-colors",
                budget === b.type ? "text-gray-600" : "text-gray-500 group-hover:text-gray-600"
              )}>
                {b.description}
              </p>
            </div>
            
            {/* Hover glow */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br rounded-2xl",
              b.gradient
            )} />
          </motion.button>
        ))}
      </div>
      
      {/* Info note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200"
      >
        <p className="text-sm text-gray-600">
          💡 <span className="font-medium">Tip:</span> Your budget helps us show relevant creators. Final pricing may vary based on your specific requirements.
        </p>
      </motion.div>
    </div>
  );
}
