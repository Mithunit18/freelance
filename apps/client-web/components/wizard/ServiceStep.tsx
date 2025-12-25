"use client";

import { motion } from 'framer-motion';
import { Camera, Video, Clapperboard } from 'lucide-react';
import { useWizardStore, ServiceType } from '@/stores/WizardStore';
import { cn } from "@vision-match/utils-js";

const services: { type: ServiceType; icon: typeof Camera; label: string; description: string }[] = [
  {
    type: 'photography',
    icon: Camera,
    label: 'Photography',
    description: 'Professional photo coverage for your event or project',
  },
  {
    type: 'videography',
    icon: Video,
    label: 'Videography',
    description: 'Cinematic video production and editing',
  },
  {
    type: 'both',
    icon: Clapperboard,
    label: 'Photo + Video',
    description: 'Complete visual coverage with both services',
  },
];

export function ServiceStep() {
  const { serviceType, setServiceType } = useWizardStore();
  localStorage.setItem('wizardServiceType', serviceType || '');

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        What service do you need?
      </h2>
      <p className="text-muted-foreground mb-8">
        Select the type of creative service for your project.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <motion.button
            key={service.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setServiceType(service.type)}
            className={cn(
              "p-6 rounded-xl border-2 transition-all text-left group",
              serviceType === service.type
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-secondary"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                serviceType === service.type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground group-hover:text-primary"
              )}
            >
              <service.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{service.label}</h3>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
