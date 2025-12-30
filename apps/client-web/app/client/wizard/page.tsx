'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader } from 'lucide-react';
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

const steps = [
  { id: 0, label: 'Service', component: ServiceStep },
  { id: 1, label: 'Category', component: CategoryStep },
  { id: 2, label: 'Location', component: LocationStep },
  { id: 3, label: 'Date', component: DateDurationStep },
  { id: 4, label: 'Style', component: StyleNotesStep },
  { id: 5, label: 'Images', component: ReferenceImagesStep },
  { id: 6, label: 'Budget', component: BudgetStep },
  { id: 7, label: 'Taste', component: StylePickerStep },
  { id: 8, label: 'Review', component: SummaryStep },
];

export default function WizardPage() {
  // 1. UPDATED: Destructured 'resetWizard' from the store
  const { currentStep, nextStep, prevStep, resetWizard } = useWizardStore();
  const CurrentStepComponent = steps[currentStep]?.component || ServiceStep;
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

  // 2. NEW FUNCTION: Handles the reset and navigation
  const handleFinish = () => {
    // Reset the store state to initial values
    //resetWizard();
    
    // Navigate to the discover page
    router.push('/discover');
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

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
         <Loader className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      index < currentStep
                        ? "bg-primary text-primary-foreground"
                        : index === currentStep
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "hidden sm:block w-12 lg:w-20 h-0.5 mx-2",
                        index < currentStep ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="hidden sm:flex items-center justify-between mt-2">
              {steps.map((step) => (
                <span
                  key={step.id}
                  className={cn(
                    "text-xs font-medium w-10 text-center",
                    step.id === currentStep ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 sm:p-12"
          >
            <CurrentStepComponent />
          </motion.div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              // 3. UPDATED: Removed Link, using onClick with handleFinish
              <Button 
                className="gap-2" 
                onClick={handleFinish}
              >
                Find Matches
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}