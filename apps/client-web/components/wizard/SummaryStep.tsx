"use client";

import { motion } from 'framer-motion';
import { Check, Camera, MapPin, IndianRupee, Palette, Calendar, Sparkles, PartyPopper } from 'lucide-react';
import { useWizardStore } from "@/stores/WizardStore";
import { cn } from "@vision-match/utils-js";

export function SummaryStep() {
  const { serviceType, category, location, eventDate, budget, selectedStyles } = useWizardStore();

  const formatService = (s: typeof serviceType) => {
    if (s === 'both') return 'Photography + Videography';
    if (s === 'photography') return 'Photography';
    if (s === 'videography') return 'Videography';
    return 'Not selected';
  };

  const formatCategory = (c: typeof category) => {
    if (!c) return 'Not selected';
    return c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ');
  };

  const formatBudget = (b: typeof budget) => {
    const budgetMap = {
      economy: '₹10K - ₹25K',
      standard: '₹25K - ₹75K',
      premium: '₹75K - ₹2L',
      luxury: '₹2L+',
    };
    return b ? budgetMap[b] : 'Not selected';
  };

  const summaryItems = [
    { icon: Camera, label: 'Service', value: formatService(serviceType), gradient: 'from-pink-500 to-rose-500' },
    { icon: PartyPopper, label: 'Category', value: formatCategory(category), gradient: 'from-purple-500 to-indigo-500' },
    { icon: MapPin, label: 'Location', value: location || 'Not specified', gradient: 'from-pink-500 to-purple-500' },
    { icon: IndianRupee, label: 'Budget', value: formatBudget(budget), gradient: 'from-blue-500 to-indigo-500' },
    { icon: Palette, label: 'Styles Selected', value: `${selectedStyles.length} styles`, gradient: 'from-pink-500 via-purple-500 to-blue-500' },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative inline-block mb-6"
        >
          {/* Celebration particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos(i * 45 * Math.PI / 180) * 60,
                y: Math.sin(i * 45 * Math.PI / 180) * 60,
              }}
              transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
              style={{ left: '50%', top: '50%' }}
            />
          ))}
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-pink-500/30">
            <Check className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Final Step</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Ready to Find Your Match!
        </h2>
        <p className="text-gray-500">
          Review your creative brief below
        </p>
      </div>

      <div className="space-y-3">
        {summaryItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:border-pink-300 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                item.gradient
              )}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-500 font-medium">{item.label}</span>
            </div>
            <span className="font-semibold text-gray-900">{item.value}</span>
          </motion.div>
        ))}
      </div>

      {eventDate && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:border-pink-300 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-500 font-medium">Event Date</span>
          </div>
          <span className="font-semibold text-gray-900">
            {new Date(eventDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </motion.div>
      )}

      {/* AI Matching Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border border-pink-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Matching</h3>
            <p className="text-sm text-gray-500">
              Our intelligent algorithm will analyze your preferences and match you with creators who specialize in your style, category, and budget range.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-6 text-center text-gray-500 text-sm"
      >
        Click "Find My Perfect Match" to discover creators that match your vision ✨
      </motion.p>
    </div>
  );
}
