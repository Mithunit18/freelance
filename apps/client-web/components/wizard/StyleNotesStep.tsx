"use client";

import { FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWizardStore } from '@/stores/WizardStore';
import { Label } from "@vision-match/ui-web";

export function StyleNotesStep() {
  const { styleNotes, setStyleNotes } = useWizardStore();

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 5 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Describe your vision
        </h2>
        <p className="text-gray-500">
          Tell us more about the style and mood you're looking for.
        </p>
      </div>

      <div>
        <Label htmlFor="styleNotes" className="text-gray-700 mb-2 block font-medium">
          Style Preferences & Notes
        </Label>
        <div className="relative">
          <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <textarea
            id="styleNotes"
            rows={8}
            placeholder="Example: Looking for candid, natural shots with warm tones. Prefer documentary style over posed photos. Want to capture genuine emotions and spontaneous moments..."
            value={styleNotes}
            onChange={(e) => setStyleNotes(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none transition resize-none"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Include any specific requirements, mood, or inspirations
        </p>
      </div>
    </div>
  );
}
