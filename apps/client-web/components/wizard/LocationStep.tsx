"use client";

import { MapPin, Calendar } from "lucide-react";
import { useWizardStore } from "@/stores/WizardStore";
import { Input, Label } from "@vision-match/ui-web";

export function LocationStep() {
  const { location, setLocation, eventDate, setEventDate } = useWizardStore();

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Where and when?
      </h2>
      <p className="text-muted-foreground mb-8">
        Tell us the location and date for your project.
      </p>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-foreground mb-2 block">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="location"
              type="text"
              placeholder="e.g., Mumbai, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-12 h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Event Date */}
        <div>
          <Label htmlFor="date" className="text-foreground mb-2 block">
            Event Date (Optional)
          </Label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="date"
              type="date"
              value={eventDate ?? ""}
              onChange={(e) =>
                setEventDate(e.target.value || null)
              }
              className="pl-12 h-12 bg-secondary border-border text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
