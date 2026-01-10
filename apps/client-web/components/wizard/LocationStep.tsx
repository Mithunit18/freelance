"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Sparkles, Navigation } from "lucide-react";
import { useWizardStore } from "@/stores/WizardStore";
import { cn } from "@vision-match/utils-js";

const popularCities = [
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Delhi', state: 'NCR' },
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Kolkata', state: 'West Bengal' },
];

export function LocationStep() {
  const { location, setLocation, eventDate, setEventDate } = useWizardStore();

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 3 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Where's your event?
        </h2>
        <p className="text-gray-500">
          Tell us the location for your project.
        </p>
      </div>

      <div className="space-y-6">
        {/* Location Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="location" className="text-gray-700 font-medium mb-3 block">
            Location
          </label>
          <div className="relative group">
            <div className={cn(
              "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-focus-within:opacity-20 blur transition-opacity"
            )} />
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
              <input
                id="location"
                type="text"
                placeholder="e.g., Mumbai, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 h-14 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Popular Cities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Popular locations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((city, index) => (
              <motion.button
                key={city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation(`${city.name}, ${city.state}`)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  location === `${city.name}, ${city.state}`
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg shadow-pink-500/20"
                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-gray-900"
                )}
              >
                {city.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200"
        >
          <p className="text-sm text-gray-600">
            💡 <span className="font-medium">Tip:</span> Creators in your area will be shown first, but we'll also show talented professionals who can travel to your location.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
