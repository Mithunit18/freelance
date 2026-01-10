"use client";

import { motion } from 'framer-motion';
import { Camera, Video, Clapperboard, Sparkles, Check } from 'lucide-react';
import { useWizardStore, ServiceType } from '@/stores/WizardStore';
import { cn } from "@vision-match/utils-js";

const services: { type: ServiceType; icon: typeof Camera; label: string; description: string; gradient: string }[] = [
  {
    type: 'photography',
    icon: Camera,
    label: 'Photography',
    description: 'Professional photo coverage for your event or project',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    type: 'videography',
    icon: Video,
    label: 'Videography',
    description: 'Cinematic video production and editing',
    gradient: 'from-purple-500 to-blue-500',
  },
  {
    type: 'both',
    icon: Clapperboard,
    label: 'Photo + Video',
    description: 'Complete visual coverage with both services',
    gradient: 'from-pink-500 to-purple-500',
  },
];

export function ServiceStep() {
  const { serviceType, setServiceType } = useWizardStore();
  localStorage.setItem('wizardServiceType', serviceType || '');

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 1 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          What service do you need?
        </h2>
        <p className="text-gray-500">
          Select the type of creative service for your project.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <motion.button
            key={service.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setServiceType(service.type)}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all text-left group overflow-hidden",
              serviceType === service.type
                ? "border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-500/10"
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
            )}
          >
            {/* Selection indicator */}
            {serviceType === service.type && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
            
            {/* Glow effect on selection */}
            {serviceType === service.type && (
              <div className={cn("absolute -inset-px rounded-2xl bg-gradient-to-br opacity-20 blur-sm", service.gradient)} />
            )}
            
            <div className="relative">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                  serviceType === service.type
                    ? `bg-gradient-to-br ${service.gradient} shadow-lg shadow-pink-500/20`
                    : "bg-gray-100 group-hover:scale-110 group-hover:bg-gray-200"
                )}
              >
                <service.icon className={cn(
                  "h-7 w-7 transition-colors",
                  serviceType === service.type ? "text-white" : "text-gray-500 group-hover:text-pink-500"
                )} />
              </div>
              
              <h3 className={cn(
                "font-semibold text-lg mb-2 transition-colors",
                serviceType === service.type ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
              )}>
                {service.label}
              </h3>
              
              <p className={cn(
                "text-sm transition-colors",
                serviceType === service.type ? "text-gray-600" : "text-gray-500 group-hover:text-gray-600"
              )}>
                {service.description}
              </p>
            </div>
            
            {/* Hover gradient effect */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br rounded-2xl",
              service.gradient
            )} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
