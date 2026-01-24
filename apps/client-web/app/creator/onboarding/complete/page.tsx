"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, Sparkles, Eye, LayoutDashboard, 
  Star, MapPin, Camera, Loader2, Rocket, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// Centralized service imports
import { detailsService, portfolioService, pricingService } from "@/services/onboarding";

const Complete = () => {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Guidelines Palette [cite: 9, 18, 27, 43]
  const palette = {
    pink: "#ec4899",
    purple: "#a855f7",
    blue: "#3b82f6",
    emerald: "#059669",
    gray600: "#4b5563",
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)"
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    
    const fetchFinalProfile = async () => {
      try {
        const [detailsRes, portfolioRes, pricingRes] = await Promise.all([
          detailsService.get(),
          portfolioService.get(),
          pricingService.get()
        ]);
        
        setProfileData({
          ...detailsRes,
          ...portfolioRes,
          ...pricingRes
        });
      } catch (error) {
        console.error("Error fetching final profile summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalProfile();
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = [palette.pink, palette.purple, palette.blue, palette.emerald];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: palette.purple }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Confetti Animation  */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 1 }}
              animate={{ y: 1000, opacity: 0 }}
              transition={{ duration: 2 + Math.random() * 2, ease: "circIn" }}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                width: "10px",
                height: "10px",
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                borderRadius: Math.random() > 0.5 ? "50%" : "0",
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl w-full mx-auto relative z-10">
        {/* Success Header  */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-4xl bg-white shadow-xl flex items-center justify-center mx-auto border border-gray-50">
              <CheckCircle2 className="w-12 h-12" style={{ color: palette.emerald }} />
            </div>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8" style={{ color: palette.pink }} />
            </motion.div>
          </div>
        </motion.div>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
            Your Profile is <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Live!</span>
          </h1>
          <p className="text-lg" style={{ color: palette.gray600 }}>
            Congratulations, {profileData?.full_name?.split(' ')[0] || 'Creator'}! You're now part of the VisionMatch community.
          </p>
        </div>

        {/* Profile Preview Card [cite: 51, 68] */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="p-8 mb-8 bg-white/80 backdrop-blur-xl border-white rounded-[2.5rem] shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Rocket className="w-24 h-24" style={{ color: palette.blue }} />
              </div>

              <div className="flex items-start gap-6 relative z-10">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0 bg-gray-50">
                  <img 
                    src={profileData?.profile_photo || "https://via.placeholder.com/200"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{profileData?.full_name || "Creative Professional"}</h3>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </Badge>
                  </div>
                  <p className="text-sm mb-4 flex items-center gap-1" style={{ color: palette.gray600 }}>
                    <MapPin className="w-4 h-4" /> {profileData?.city || "Creative Hub"}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-60">
                    <span className="flex items-center gap-1">
                      <Camera className="w-4 h-4" /> {profileData?.categories?.[0] || "Artist"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" /> New Creator
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Portfolio Items", value: profileData?.portfolio_images?.length || 0 },
                  { label: "Starting Rate", value: `₹${profileData?.starting_price ? (profileData.starting_price / 1000).toFixed(0) : 0}K` },
                  { label: "Experience", value: `${profileData?.years_experience || 0}+ Yrs` }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-black text-gray-800">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: palette.gray600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
        </motion.div>

        {/* Action Buttons [cite: 43, 106] */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => router.push("/creator/dashboard")}
            className="h-14 px-10 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-all group"
            style={{ background: palette.brandGradient }}
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
          <Button 
            variant="outline"
            size="lg" 
            onClick={() => router.push("/creator/profile")}
            className="h-14 px-10 rounded-2xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
          >
            <Eye className="w-5 h-5 mr-2" />
            Preview Profile
          </Button>
        </div>

        {/* Next Steps Roadmap [cite: 61, 91] */}
        <Card className="p-8 mt-12 bg-white/40 border-white rounded-4xl shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6 text-center">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { step: "1", text: "AI matching with top clients", color: palette.pink },
              { step: "2", text: "Direct requests in your inbox", color: palette.purple },
              { step: "3", text: "Secure payments & growth", color: palette.blue },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div 
                  className="w-10 h-10 rounded-xl text-white font-black flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: item.color }}
                >
                  {item.step}
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{ color: palette.gray600 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Complete;