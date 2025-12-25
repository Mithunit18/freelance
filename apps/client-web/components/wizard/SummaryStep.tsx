"use client";

import { Check, Camera, MapPin, IndianRupee, Palette } from 'lucide-react';
import { useWizardStore } from "@/stores/WizardStore";

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
    { icon: Camera, label: 'Service', value: formatService(serviceType) },
    { icon: Camera, label: 'Category', value: formatCategory(category) },
    { icon: MapPin, label: 'Location', value: location || 'Not specified' },
    { icon: IndianRupee, label: 'Budget', value: formatBudget(budget) },
    { icon: Palette, label: 'Styles Selected', value: `${selectedStyles.length} styles` },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Ready to Match!
          </h2>
          <p className="text-muted-foreground">
            Review your project brief below
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      {eventDate && (
        <div className="mt-4 p-4 rounded-lg bg-secondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">Event Date</span>
          </div>
          <span className="font-medium text-foreground">
            {eventDate && (
              <span className="font-medium text-foreground">
                {new Date(eventDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}

          </span>
        </div>
      )}

      <p className="mt-8 text-center text-muted-foreground">
        Click "Find Matches" to see creators that match your vision.
      </p>
    </div>
  );
}
