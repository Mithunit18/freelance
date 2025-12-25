"use client";

import { useEffect, useState } from "react";
import { Camera, Star, Briefcase, ArrowRight, UserCircle, Sparkles, PlayCircle, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Auth } from "@/services/Auth"; 
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const palette = {
    pink: "#ec4899",
    purple: "#a855f7",
    blue: "#3b82f6",
    gray600: "#4b5563",
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
    ctaGradient: "linear-gradient(to right, #ec4899, #3b82f6)"
  };

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
      {/* Brand Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ backgroundColor: palette.pink }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ backgroundColor: palette.blue }} />

      {/* Header */}
      <header className="relative z-50 px-6 py-5 border-b border-gray-100 bg-white/60 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: palette.brandGradient }}>
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-800">
              Vision<span style={{ color: palette.pink }}>Match</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-pink-500 transition-colors">Find Creators</a>
            <a href="#" className="hover:text-pink-500 transition-colors">How it Works</a>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : user ? (
              /* ENHANCED MEMBER CAPSULE */
              <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 px-3 py-1">
                   <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {user.avatar ? (
                          <img src={user.avatar} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      {/* Member Status Glow */}
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                   </div>
                   <div className="hidden sm:block">
                      <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400 leading-none mb-1">Authenticated</p>
                      <p className="text-sm font-bold text-gray-800 leading-none">{user.name?.split(' ')[0]}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => router.push(user.role === 'client' ? '/client/dashboard' : '/creator/dashboard')}
                    className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all active:scale-90"
                    title="Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all active:scale-90"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/login")} className="font-bold text-gray-600">Log In</Button>
                <Button onClick={() => router.push("/signup")} className="rounded-xl px-6 font-bold text-white shadow-lg shadow-pink-200" style={{ background: palette.ctaGradient }}>Join Free</Button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm"
            >
              <Sparkles className="w-4 h-4" style={{ color: palette.pink }} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {user ? `Welcome back to your creative hub` : "The AI-Powered Creative Marketplace"}
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight text-gray-800">
              Find Your Perfect<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                Creative Partner
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed text-gray-500">
              Connect with elite photographers and videographers through our
              intelligent matching algorithm. Premium results, simplified.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg"
                onClick={() => {
                    if (user) {
                        router.push(user.role === 'client' ? '/client/dashboard' : '/creator/onboarding');
                    } else {
                        router.push("/signup");
                    }
                }}
                className="h-16 px-10 rounded-2xl text-lg font-bold text-white shadow-xl hover:shadow-pink-200 transition-all group"
                style={{ background: palette.ctaGradient }}
              >
                {user ? "Resume Dashboard" : "Start Your Project"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              {!user && (
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-gray-200 bg-white text-lg font-bold text-gray-600">
                  <PlayCircle className="w-5 h-5 mr-2" /> Watch Demo
                </Button>
              )}
            </div>

            {/* Stats Card */}
            <div className="pt-20">
              <Card className="max-w-4xl mx-auto p-8 bg-white/60 backdrop-blur-xl border-white rounded-[2.5rem] shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-2">
                    <div className="flex -space-x-3 justify-center mb-4">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                          <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                        </div>
                      ))}
                    </div>
                    <div className="text-3xl font-black text-gray-800">2,000+</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Verified Creators</div>
                  </div>

                  <div className="space-y-2 flex flex-col justify-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800">4.9/5</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Satisfaction Rating</div>
                  </div>

                  <div className="space-y-2 flex flex-col justify-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Briefcase className="w-6 h-6" style={{ color: palette.blue }} />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800">10k+</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Projects Shipped</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}