"use client";

import { Calendar, Clock } from "lucide-react";
import { useEffect } from "react";
import { useWizardStore } from "@/stores/WizardStore";
import { Input, Label } from "@vision-match/ui-web";

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
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
        When and how long?
      </h2>
      <p className="text-slate-300 mb-8">
        Tell us the date and expected duration of your project.
      </p>

      <div className="space-y-6">
        {/* Event Date */}
        <div>
          <Label htmlFor="date" className="text-white mb-2 block">
            Event Date
          </Label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="date"
              type="date"
              value={eventDate ?? ""}
              onChange={(e) =>
                setEventDate(e.target.value || null)
              }
              className="pl-12 h-12 bg-slate-900/50 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <Label htmlFor="duration" className="text-white mb-2 block">
            Duration (hours)
          </Label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="duration"
              type="number"
              min="1"
              max="24"
              placeholder="e.g., 4"
              value={duration ?? ""}
              onChange={(e) =>
                setDuration(e.target.value ? Number(e.target.value) : null)
              }
              className="pl-12 h-12 bg-slate-900/50 border-white/10 text-white"
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Estimate the total hours you'll need coverage
          </p>
        </div>
      </div>
    </div>
  );
}
