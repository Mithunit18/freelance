"use client";

import { FileText } from 'lucide-react';
import { useWizardStore } from '@/stores/WizardStore';
import { Label } from "@vision-match/ui-web";

export function StyleNotesStep() {
  const { styleNotes, setStyleNotes } = useWizardStore();

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
        Describe your vision
      </h2>
      <p className="text-slate-300 mb-8">
        Tell us more about the style and mood you're looking for.
      </p>

      <div>
        <Label htmlFor="styleNotes" className="text-white mb-2 block">
          Style Preferences & Notes
        </Label>
        <div className="relative">
          <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
          <textarea
            id="styleNotes"
            rows={8}
            placeholder="Example: Looking for candid, natural shots with warm tones. Prefer documentary style over posed photos. Want to capture genuine emotions and spontaneous moments..."
            value={styleNotes}
            onChange={(e) => setStyleNotes(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none transition resize-none"
          />
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Include any specific requirements, mood, or inspirations
        </p>
      </div>
    </div>
  );
}
