"use client";

import { useEffect, useState } from "react";
import { 
  MapPin, 
  Camera, 
  Star, 
  Briefcase, 
  Globe, 
  Languages, 
  Share2, 
  Edit3, 
  Loader2, 
  CheckCircle2, 
  Instagram, 
  ArrowRight, // Ensured import
  ArrowLeft 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  detailsService, 
  portfolioService, 
  pricingService 
} from "@/services/onboarding";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Platform Official Palette Guidelines [cite: 9, 18, 32, 65]
  const palette = {
    pink: "#ec4899",   // Pink 500 [cite: 9]
    purple: "#a855f7", // Purple 500 [cite: 18]
    blue: "#3b82f6",   // Blue 500 [cite: 32]
    gray800: "#1f2937", // Gray 800 for text visibility [cite: 65]
    gray600: "#4b5563", // Gray 600 for secondary text [cite: 64]
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)", // Soft Background [cite: 50]
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)" // Primary Brand Gradient [cite: 46]
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [details, portfolio, pricing] = await Promise.all([
          detailsService.get(),
          portfolioService.get(),
          pricingService.get()
        ]);
        setProfile({ ...details, ...portfolio, ...pricing });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f9fafb]">
      <Loader2 className="animate-spin w-12 h-12" style={{ color: palette.purple }} />
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: palette.bgGradient }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION: Identity & Actions */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12 items-start lg:items-end justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-6 items-center">
            <div className="relative group">
              {/* Brand Glow Frame [cite: 15, 102] */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#ec4899] via-[#a855f7] to-[#3b82f6] rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2.2rem] border-4 border-white shadow-2xl overflow-hidden bg-white">
                <img src={profile?.profile_photo || "https://via.placeholder.com/200"} className="w-full h-full object-cover" alt="Profile" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-50">
                <CheckCircle2 className="w-6 h-6 text-[#059669]" /> {/* Emerald 600 for Success  */}
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#1f2937] mb-2">
                {profile?.full_name}
              </h1>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge className="bg-white/60 backdrop-blur-md border-gray-100 text-[#4b5563] font-bold px-3 py-1 rounded-lg">
                  <Camera className="w-3 h-3 mr-1" style={{ color: palette.pink }} /> {profile?.categories?.[0] || "Creator"}
                </Badge>
                <span className="flex items-center text-sm font-bold text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" /> {profile?.city}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 w-full lg:w-auto">
            <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-xl font-bold border-gray-200 text-gray-600 bg-white">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button className="flex-1 lg:flex-none h-12 px-8 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95" style={{ background: palette.brandGradient }}>
              <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* BENTO GRID LAYOUT [cite: 102] */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* About Section */}
          <Card className="md:col-span-8 p-8 bg-white/70 backdrop-blur-2xl border-white rounded-[2.5rem] shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">About Creator</h3>
            <p className="text-lg font-medium leading-relaxed text-[#1f2937] mb-10 max-w-3xl">
              {profile?.bio || "Creative professional dedicated to visual excellence."}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Starting Rate</p>
                <p className="text-2xl font-black text-[#1f2937]">₹{(profile?.starting_price / 1000).toFixed(0)}K<span className="text-xs font-bold opacity-30">/day</span></p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Experience</p>
                <p className="text-2xl font-black text-[#1f2937]">{profile?.years_experience}+ <span className="text-xs font-bold opacity-30">YRS</span></p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Travel</p>
                <p className="text-2xl font-black text-[#1f2937]">{profile?.travel_available ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Rating</p>
                <p className="text-2xl font-black text-[#1f2937] flex items-center">4.9 <Star className="w-4 h-4 ml-1 fill-[#eab308] text-[#eab308]" /></p> {/* Yellow 500  */}
              </div>
            </div>
          </Card>

          {/* Connect Area */}
          <Card className="md:col-span-4 p-8 bg-white/70 backdrop-blur-2xl border-white rounded-[2.5rem] shadow-sm flex flex-col justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Connect</h3>
            <div className="space-y-4 flex-grow">
              <button className="flex items-center justify-between w-full p-4 rounded-2xl bg-white border border-gray-50 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-50 text-[#ec4899] group-hover:scale-110 transition-transform"><Instagram className="w-5 h-5" /></div>
                  <span className="font-bold text-[#1f2937]">Instagram</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>
            </div>
            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-white mt-8 shadow-xl" style={{ background: "linear-gradient(to right, #ec4899, #3b82f6)" }}>
              Book Session
            </Button>
          </Card>

          {/* Masterpieces Gallery */}
          <Card className="md:col-span-12 p-8 bg-white/70 backdrop-blur-2xl border-white rounded-[3rem] shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Masterpieces Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile?.portfolio_images?.map((img: string, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }}
                  className="relative group rounded-2xl overflow-hidden shadow-lg border-2 border-white aspect-[4/5]"
                >
                  <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Work" />
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}