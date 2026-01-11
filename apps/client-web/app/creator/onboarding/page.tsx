"use client";

import { useEffect, useState } from "react";
import { Clock, Images, DollarSign, User, Shield, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { onboardingService } from "@/services/onboarding";
import { motion } from "framer-motion";

const OnboardingLanding = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resumeStep, setResumeStep] = useState<string>("/creator/onboarding/portfolio");
  const [isNewUser, setIsNewUser] = useState(true);
  const [currentStepNum, setCurrentStepNum] = useState(1);

  // PALETTE INTEGRATION [cite: 9, 18, 32, 46, 64]
  const palette = {
    pink: "#ec4899",
    purple: "#a855f7",
    blue: "#3b82f6",
    gray50: "#f9fafb",
    gray600: "#4b5563",
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)"
  };

  useEffect(() => {
    const checkUserProgress = async () => {
      try {
        const data = await onboardingService.getStatus();
        const { current_step, status } = data;

        if (status === "completed") {
          router.replace("/creator/dashboard");
          return;
        }

        const stepRoutes: Record<number, string> = {
          1: "/creator/onboarding/portfolio",
          2: "/creator/onboarding/pricing",
          3: "/creator/onboarding/details",
          4: "/creator/onboarding/verification",
          5: "/creator/onboarding/complete"
        };

        if (current_step > 1) {
          setResumeStep(stepRoutes[current_step] || "/creator/onboarding/portfolio");
          setIsNewUser(false);
          setCurrentStepNum(current_step);
        }
      } catch (error) {
        console.error("New session initiated.");
      } finally {
        setLoading(false);
      }
    };
    checkUserProgress();
  }, [router]);

  const steps = [
    { icon: Images, title: "Portfolio", description: "Upload your best work", color: "#3b82f6" }, // Blue [cite: 32]
    { icon: DollarSign, title: "Pricing", description: "Set your rates", color: "#059669" },      // Emerald 
    { icon: User, title: "Details", description: "Professional info", color: "#a855f7" },        // Purple [cite: 18]
    { icon: Shield, title: "Verification", description: "Build trust", color: "#ec4899" },       // Pink [cite: 9]
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12" style={{ color: palette.pink }} />
        </motion.div>
        <p className="mt-4 font-medium" style={{ color: palette.gray600 }}>Syncing progress...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: palette.bgGradient }} // Soft Background Gradient 
    >
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left side - Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-8 backdrop-blur-md"
              style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: palette.pink }}
            >
              <Sparkles className="w-4 h-4" />
              Build a professional presence
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1] text-[#1f2937]">
              {isNewUser ? "Start Your" : "Continue Your"}{" "}
              <span 
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: palette.brandGradient }} // Primary Brand Gradient 
              >
                Creative Legacy
              </span>
            </h1>

            <p className="text-xl mb-10 leading-relaxed max-w-lg" style={{ color: palette.gray600 }}>
              {isNewUser 
                ? "Join the elite circle of creators. Set up your workspace, showcase your vision, and start receiving project invites today."
                : `You're currently at Step ${currentStepNum} of 4. Jump back in and finish your profile to unlock premium client matching.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => router.push(resumeStep)}
                className="group relative overflow-hidden text-white rounded-xl h-14 px-10 text-lg font-bold transition-all shadow-lg hover:shadow-pink-200/50"
                style={{ 
                    background: "linear-gradient(to right, #ec4899, #3b82f6)" // CTA Gradient 
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isNewUser ? "Launch Onboarding" : "Resume Progress"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <div className="flex items-center gap-3 px-6 py-4 text-sm italic" style={{ color: palette.gray600 }}>
                <Clock className="w-4 h-4" />
                Est. time: 4 mins
              </div>
            </div>
          </motion.div>

          {/* Right side - Steps Visualization */}
          <div className="relative">
            <div className="space-y-4 relative">
              {steps.map((step, index) => {
                const isCompleted = currentStepNum > index + 1;
                const isCurrent = currentStepNum === index + 1;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card
                      className="p-6 flex items-center gap-5 transition-all border rounded-2xl shadow-sm bg-white"
                      style={{ 
                        borderColor: isCurrent ? palette.purple : "#e5e7eb", // Purple secondary accent [cite: 18]
                        transform: isCurrent ? "scale(1.02)" : "scale(1)"
                      }}
                    >
                      <div 
                        className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
                        style={{ backgroundColor: isCurrent ? `${step.color}15` : "#f3f4f6" }}
                      >
                        <step.icon className="w-7 h-7" style={{ color: isCurrent ? step.color : palette.gray600 }} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg" style={{ color: isCurrent ? "#1f2937" : palette.gray600 }}>
                            {step.title}
                          </h3>
                          {isCompleted && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#059669" }} /> // Emerald success 
                          )}
                        </div>
                        <p className="text-sm font-medium" style={{ color: palette.gray600 }}>{step.description}</p>
                      </div>

                      <div className="text-2xl font-black opacity-10" style={{ color: "#1f2937" }}>
                        0{index + 1}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingLanding;