"use client";

import { useEffect, useState } from "react";
import { Camera, Star, ArrowRight, UserCircle, Sparkles, PlayCircle, LogOut, LayoutDashboard, Loader2, CheckCircle2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Auth } from "@/services/Auth"; 
import { toast } from "sonner";
import Image from "next/image";

// Floating Image Card Component
const FloatingImageCard = ({ 
  src, 
  rating, 
  position, 
  rotation, 
  delay = 0,
  size = "medium"
}: { 
  src: string; 
  rating: number; 
  position: string; 
  rotation: number;
  delay?: number;
  size?: "small" | "medium" | "large";
}) => {
  const sizeClasses = {
    small: "w-32 h-44 md:w-40 md:h-52",
    medium: "w-40 h-52 md:w-48 md:h-64",
    large: "w-48 h-60 md:w-56 md:h-72"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`absolute ${position} z-20`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
        style={{ transform: `rotate(${rotation}deg)` }}
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white`}
      >
        <div className="relative w-full h-full">
          <img 
            src={src} 
            alt="Creative work"
            className="w-full h-full object-cover"
          />
          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-sm font-semibold">{rating}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const palette = {
    pink: "#ec4899",
    pink600: "#db2777",
    purple: "#a855f7",
    blue: "#3b82f6",
    gray600: "#4b5563",
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
    ctaGradient: "linear-gradient(to right, #ec4899, #db2777)"
  };

  // Sample images for floating cards
  const floatingImages = [
    { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop", rating: 4.9, position: "left-4 md:left-12 top-24", rotation: -6, size: "medium" as const, delay: 0.2 },
    { src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=600&fit=crop", rating: 4.9, position: "right-4 md:right-12 top-16", rotation: 6, size: "medium" as const, delay: 0.4 },
    { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop", rating: 4.9, position: "left-8 md:left-24 bottom-20", rotation: 8, size: "large" as const, delay: 0.6 },
    { src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=600&fit=crop", rating: 4.9, position: "right-8 md:right-20 bottom-28", rotation: -8, size: "medium" as const, delay: 0.8 },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await Auth.me();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    const t = toast.loading("Logging out...");
    try {
      await Auth.logout(); 
      setUser(null);
      toast.success("Logged out successfully", { id: t });
      router.push("/");
    } catch (err) {
      toast.error("Logout failed", { id: t });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Subtle Background Orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-15" style={{ backgroundColor: palette.pink }} />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-15" style={{ backgroundColor: palette.blue }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-10" style={{ backgroundColor: palette.purple }} />

      {/* Header / Navigation */}
      <header className="relative z-50 px-4 md:px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50" style={{ background: palette.ctaGradient }}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-800">
              Vision<span style={{ color: palette.pink }}>Match</span>
            </span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <a href="#" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gray-900 transition-colors">Home</a>
            <a href="#" className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">Find Creators</a>
            <a href="#" className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">Start Project</a>
            <a href="#" className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">How It Works</a>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : user ? (
              <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 px-3 py-1">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <UserCircle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-none mb-0.5">Welcome back</p>
                    <p className="text-sm font-bold text-gray-800 leading-none">{user.name?.split(' ')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => router.push(user.role === 'client' ? '/client/dashboard' : '/creator/dashboard')}
                    className="p-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                    title="Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push("/login")} 
                  className="font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push("/signup")} 
                  className="rounded-xl px-5 font-semibold text-white shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all"
                  style={{ background: palette.ctaGradient }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section with Floating Images */}
      <main className="relative z-10 min-h-[calc(100vh-80px)]">
        {/* Floating Image Cards - Hidden on mobile for cleaner look */}
        <div className="hidden md:block">
          {floatingImages.map((img, idx) => (
            <FloatingImageCard key={idx} {...img} />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-30 px-4 md:px-6 pt-16 md:pt-24 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* AI Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-pink-200 bg-pink-50/80 backdrop-blur-sm mb-8"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-semibold text-pink-600">
                AI-Powered Creative Matching
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-gray-900 mb-6"
            >
              Find Your Perfect<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                Creative Partner
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-500 mb-8"
            >
              Connect with <span className="font-semibold text-pink-500">elite photographers</span> and{" "}
              <span className="font-semibold text-purple-500">videographers</span> through our intelligent matching algorithm
            </motion.p>

            {/* Stats Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-10"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                <Camera className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">500+ Photographers</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                <Video className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">300+ Videographers</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">Verified Profiles</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg"
                onClick={() => {
                  if (user) {
                    router.push(user.role === 'client' ? '/client/dashboard' : '/creator/onboarding');
                  } else {
                    router.push("/signup");
                  }
                }}
                className="h-14 px-8 rounded-xl text-base font-semibold text-white shadow-xl shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-[1.02] transition-all group"
                style={{ background: palette.ctaGradient }}
              >
                {user ? "Go to Dashboard" : "Start Your Project"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => router.push("/discover")}
                className="h-14 px-8 rounded-xl border-gray-300 bg-white hover:bg-gray-50 text-base font-semibold text-gray-700 shadow-sm hover:shadow-md transition-all group"
              >
                <PlayCircle className="w-5 h-5 mr-2 text-gray-500 group-hover:text-pink-500 transition-colors" /> 
                Browse Creators
              </Button>
            </motion.div>

            {/* Trust Section - Mobile Floating Cards */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="md:hidden mt-12 grid grid-cols-2 gap-3"
            >
              {floatingImages.slice(0, 4).map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative aspect-3/4 rounded-xl overflow-hidden shadow-lg border-2 border-white"
                >
                  <img src={img.src} alt="Creative work" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-xs font-semibold">{img.rating}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}