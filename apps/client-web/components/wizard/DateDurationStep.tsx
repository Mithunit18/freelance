"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useWizardStore } from "@/stores/WizardStore";
import { cn } from "@vision-match/utils-js";

const durationOptions = [
  { hours: 2, label: '2 hours', description: 'Quick session' },
  { hours: 4, label: '4 hours', description: 'Half day coverage' },
  { hours: 6, label: '6 hours', description: 'Standard event' },
  { hours: 8, label: '8 hours', description: 'Full day coverage' },
  { hours: 10, label: '10+ hours', description: 'Extended coverage' },
];

export function DateDurationStep() {
  const { eventDate, setEventDate, duration, setDuration } = useWizardStore();

  // ✅ Persist safely (side effects belong in useEffect)
  useEffect(() => {
    if (eventDate) {
      localStorage.setItem("wizardEventDate", eventDate);
    }
  }, [eventDate]);

  useEffect(() => {
    if (duration !== null) {
      localStorage.setItem("wizardDuration", duration.toString());
    }
  }, [duration]);

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 4 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          When and how long?
        </h2>
        <p className="text-gray-500">
          Tell us the date and expected duration of your project.
        </p>
      </div>

      <div className="space-y-8">
        {/* Event Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="date" className="text-gray-700 font-medium mb-3 block">
            Event Date
          </label>
          <div className="relative group">
            <div className={cn(
              "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-focus-within:opacity-20 blur transition-opacity"
            )} />
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
              <input
                id="date"
                type="date"
                value={eventDate ?? ""}
                onChange={(e) =>
                  setEventDate(e.target.value || null)
                }
                className="w-full pl-12 pr-4 h-14 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:border-pink-400 focus:outline-none transition-all cursor-pointer"
              />
            </div>
          </div>
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-400" />
            <label className="text-gray-700 font-medium">Duration</label>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {durationOptions.map((option, index) => (
              <motion.button
                key={option.hours}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDuration(option.hours)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all text-center group overflow-hidden",
                  duration === option.hours
                    ? "border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-500/10"
                    : "border-gray-200 hover:border-pink-300 bg-white hover:bg-pink-50/30"
                )}
              >
                <div className={cn(
                  "text-2xl font-bold mb-1 transition-colors",
                  duration === option.hours ? "text-pink-500" : "text-gray-700 group-hover:text-gray-900"
                )}>
                  {option.hours === 10 ? '10+' : option.hours}
                </div>
                <div className={cn(
                  "text-xs transition-colors",
                  duration === option.hours ? "text-gray-600" : "text-gray-500 group-hover:text-gray-600"
                )}>
                  {option.description}
                </div>
                
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl" />
              </motion.button>
            ))}
          </div>
          
          {/* Custom input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <span className="text-sm text-gray-500 block mb-2">Or enter custom hours:</span>
            <div className="relative group max-w-[200px]">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
              <input
                id="duration"
                type="number"
                min="1"
                max="24"
                placeholder="Hours"
                value={duration ?? ""}
                onChange={(e) =>
                  setDuration(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full pl-12 pr-4 h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none transition-all"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
