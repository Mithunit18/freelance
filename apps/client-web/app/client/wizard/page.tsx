'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader, Sparkles, Camera, Heart, MapPin, Calendar, Palette, Image, IndianRupee, Eye } from 'lucide-react';
import { useWizardStore } from '@/stores/WizardStore';
import { Button } from '@vision-match/ui-web';
import { cn } from '@vision-match/utils-js';
import { Header } from '@/components/layout/Header';
import { ServiceStep } from '@/components/wizard/ServiceStep';
import { CategoryStep } from '@/components/wizard/CategoryStep';
import { LocationStep } from '@/components/wizard/LocationStep';
import { DateDurationStep } from '@/components/wizard/DateDurationStep';
import { StyleNotesStep } from '@/components/wizard/StyleNotesStep';
import { ReferenceImagesStep } from '@/components/wizard/ReferenceImagesStep';
import { BudgetStep } from '@/components/wizard/BudgetStep';
import { StylePickerStep } from '@/components/wizard/StylePickerStep';
import { SummaryStep } from '@/components/wizard/SummaryStep';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Auth } from '@/services/Auth';
import { palette, themeClasses } from '@/utils/theme';

const steps = [
  { id: 0, label: 'Service', component: ServiceStep, icon: Camera, color: 'from-pink-500 to-purple-500' },
  { id: 1, label: 'Category', component: CategoryStep, icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 2, label: 'Location', component: LocationStep, icon: MapPin, color: 'from-purple-500 to-blue-500' },
  { id: 3, label: 'Date', component: DateDurationStep, icon: Calendar, color: 'from-pink-400 to-purple-500' },
  { id: 4, label: 'Style', component: StyleNotesStep, icon: Palette, color: 'from-purple-500 to-pink-500' },
  { id: 5, label: 'Images', component: ReferenceImagesStep, icon: Image, color: 'from-pink-500 to-purple-500' },
  { id: 6, label: 'Budget', component: BudgetStep, icon: IndianRupee, color: 'from-purple-500 to-blue-500' },
  { id: 7, label: 'Taste', component: StylePickerStep, icon: Sparkles, color: 'from-pink-500 to-purple-500' },
  { id: 8, label: 'Review', component: SummaryStep, icon: Eye, color: 'from-pink-500 via-purple-500 to-blue-500' },
];

export default function WizardPage() {
  const { currentStep, nextStep, prevStep, resetWizard } = useWizardStore();
  const CurrentStepComponent = steps[currentStep]?.component || ServiceStep;
  const CurrentIcon = steps[currentStep]?.icon || Camera;
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await Auth.me();
        if (!user) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed", error);
        router.push("/login");
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleFinish = () => {
    router.push('/client/discover');
  };

  const canProceed = () => {
    const state = useWizardStore.getState();
    switch (currentStep) {
      case 0: return state.serviceType !== null;
      case 1: return state.category !== null;
      case 2: return state.location.trim() !== '';
      case 3: return state.eventDate !== null && state.duration !== null;
      case 4: return true; 
      case 5: return true; 
      case 6: return state.budget !== null;
      case 7: return state.selectedStyles.length >= 3;
      default: return true;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-30 rounded-full" style={{ backgroundColor: palette.pink }} />
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ background: palette.ctaGradient }}>
              <Loader className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Preparing your creative journey...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Background Effects - matching landing page exactly */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[250px] opacity-10" style={{ backgroundColor: palette.purple }} />
      </div>
      
      <Header />
      
      <main className="relative pt-28 pb-16 px-4">
        <div className="mx-auto max-w-4xl">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-pink-200 bg-white/90 backdrop-blur-sm mb-6 shadow-lg shadow-pink-100/50"
            >
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-bold text-pink-600">AI-Powered Matching</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4">
              Create Your{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                Creative Brief
              </span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Tell us about your vision and we'll find the perfect photographer or videographer for you.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="relative">
              {/* Background Track */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                {/* Progress Fill */}
                <motion.div 
                  className="h-full rounded-full"
                  style={{ background: palette.brandGradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              
              {/* Step Markers */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                          isCompleted
                            ? "border-transparent shadow-lg"
                            : isCurrent
                            ? "bg-white border-pink-500 shadow-lg shadow-pink-200/50"
                            : "bg-white border-gray-200"
                        )}
                        style={isCompleted ? { background: palette.ctaGradient } : undefined}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        ) : (
                          <StepIcon className={cn(
                            "h-4 w-4 sm:h-5 sm:w-5",
                            isCurrent ? "text-pink-500" : "text-gray-400"
                          )} />
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      <div className={cn(
                        "absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-all",
                        isCurrent ? "text-pink-500" : isCompleted ? "text-purple-500" : "text-gray-400"
                      )}>
                        <span className="hidden sm:inline">{step.label}</span>
                      </div>
                      
                      {/* Current indicator ring */}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-pink-400"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Step Counter */}
            <div className="mt-14 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Step</span>
              <span className="text-lg font-bold text-pink-500">{currentStep + 1}</span>
              <span className="text-sm text-gray-500">of</span>
              <span className="text-lg font-bold text-gray-600">{steps.length}</span>
            </div>
          </motion.div>

          {/* Step Content Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              {/* Main Card */}
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500">
                {/* Step Icon Badge */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className={cn(
                    "absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    steps[currentStep].color
                  )}
                >
                  <CurrentIcon className="h-6 w-6 text-white" />
                </motion.div>
                
                <div className="mt-4">
                  <CurrentStepComponent />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center justify-between"
          >
            <motion.button
              whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
              whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
              onClick={prevStep}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm"
              )}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>

            {currentStep < steps.length - 1 ? (
              <motion.button
                whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                onClick={nextStep}
                disabled={!canProceed()}
                className={cn(
                  "relative flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 overflow-hidden",
                  canProceed()
                    ? "text-white shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
                style={canProceed() ? { background: palette.ctaGradient } : undefined}
              >
                {canProceed() && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                )}
                <span className="relative">Continue</span>
                <ArrowRight className="h-5 w-5 relative" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                className="relative flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all duration-300 overflow-hidden"
                style={{ background: palette.brandGradient }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <Sparkles className="h-5 w-5 relative" />
                <span className="relative">Find My Perfect Match</span>
                <ArrowRight className="h-5 w-5 relative" />
              </motion.button>
            )}
          </motion.div>

          {/* Help Text */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            {currentStep === steps.length - 1 
              ? "Review your choices and click to discover matching creators"
              : "Complete each step to help us find your ideal creative professional"
            }
          </motion.p>
        </div>
      </main>
    </div>
  );
}