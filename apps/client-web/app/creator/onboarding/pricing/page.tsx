"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, ChevronRight, Loader2, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { pricingService } from '@/services/onboarding';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  duration: string;
  icon: string;
  color: string;
  popular?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for building your initial portfolio',
    startingPrice: 10000,
    duration: 'per day',
    icon: '📸',
    color: "#3b82f6", // Blue
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Standard rates for experienced creators',
    startingPrice: 25000,
    duration: 'per day',
    icon: '⭐',
    color: "#a855f7", // Purple
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Specialized or high-end production work',
    startingPrice: 50000,
    duration: 'per day',
    icon: '👑',
    color: "#ec4899", // Pink
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>('professional');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
    const loadPricingData = async () => {
      try {
        const data = await pricingService.get();
        if (data && data.starting_price) {
          const matchingTier = PRICING_TIERS.find(t => t.startingPrice === data.starting_price);
          if (matchingTier) {
            setSelectedTier(matchingTier.id);
            setCustomPrice('');
          } else {
            setCustomPrice(data.starting_price.toString());
            setSelectedTier('');
          }
        }
      } catch (error) {
        console.log("Starting fresh pricing session.");
      } finally {
        setFetching(false);
      }
    };
    loadPricingData();
  }, []);

  const selectedTierData = PRICING_TIERS.find((t) => t.id === selectedTier);
  const displayPrice = customPrice || selectedTierData?.startingPrice?.toString() || '0';

  const handleNext = async () => {
    const finalPrice = customPrice ? parseFloat(customPrice) : selectedTierData?.startingPrice;
    if (!finalPrice || finalPrice <= 0) return toast.error("Please set a valid starting price");

    setLoading(true);
    try {
      await pricingService.setup({
        starting_price: finalPrice,
        currency: "INR",
        price_unit: "per day",
        negotiable: true,
      });
      toast.success("Pricing updated successfully");
      router.push('/creator/onboarding/details');
    } catch (error: any) {
      toast.error("Failed to save pricing");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: palette.purple }} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 selection:bg-pink-100" style={{ background: palette.bgGradient }}>
      <div className="max-w-5xl w-full">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-100 text-sm font-bold uppercase tracking-wider mb-6 shadow-sm"
            style={{ color: palette.pink }}
          >
            <TrendingUp className="w-4 h-4" /> Step 2: Service Rates
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-gray-800 leading-tight">
            Set Your <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Starting Price</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: palette.gray600 }}>
            Clients often filter by budget. Choose a tier that matches your experience level or set a specific daily rate.
          </p>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PRICING_TIERS.map((tier, idx) => {
            const isSelected = selectedTier === tier.id;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => { setSelectedTier(tier.id); setCustomPrice(''); }}
                className="cursor-pointer group relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <Card 
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 bg-white h-full flex flex-col items-center text-center overflow-hidden ${
                    isSelected ? "shadow-2xl scale-[1.03]" : "shadow-sm border-transparent hover:border-gray-200 grayscale-[0.5] opacity-80 hover:opacity-100 hover:grayscale-0"
                  }`}
                  style={{ borderColor: isSelected ? tier.color : undefined }}
                >
                  {/* Decorative Circle background */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-5" style={{ background: tier.color }} />

                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500">{tier.icon}</div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">{tier.name}</h3>
                  <p className="text-sm font-medium mb-8 leading-relaxed" style={{ color: palette.gray600 }}>{tier.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 w-full">
                    <span className="text-4xl font-black tracking-tighter" style={{ color: tier.color }}>
                      ₹{tier.startingPrice.toLocaleString()}
                    </span>
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mt-1">{tier.duration}</p>
                  </div>

                  <div className={`mt-6 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                    isSelected ? "bg-emerald-500 text-white rotate-0" : "bg-gray-50 text-transparent -rotate-45"
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Price Area */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="max-w-3xl mx-auto p-10 bg-white/70 backdrop-blur-2xl border-white rounded-[3rem] shadow-xl mb-16 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full transition-colors" style={{ background: customPrice ? palette.brandGradient : 'transparent' }} />
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5" style={{ color: palette.blue }} />
                  <label className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: palette.gray600 }}>
                    Set a custom daily rate
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black opacity-20">₹</span>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => {
                      setCustomPrice(e.target.value);
                      if (e.target.value) setSelectedTier('');
                    }}
                    placeholder={selectedTierData?.startingPrice.toString() || "Enter amount"}
                    className="w-full pl-14 pr-6 py-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-4xl font-black focus:outline-none focus:ring-4 transition-all placeholder:opacity-20"
                    // Correct implementation to avoid error
                    style={{ 
                      outlineColor: palette.purple,
                      color: palette.purple 
                    }}
                  />
                </div>
              </div>
              
              <div className="hidden md:block w-px h-24 bg-gray-100" />

              <div className="text-center md:text-left min-w-[200px]">
                <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-40">Final Quote</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-5xl font-black tracking-tighter" style={{ color: palette.emerald }}>
                    ₹{parseInt(displayPrice || '0').toLocaleString()}
                  </p>
                  <span className="text-sm font-bold opacity-40">/day</span>
                </div>
                {parseFloat(displayPrice) > 0 && (
                  <p className="text-[10px] mt-2 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                    Valid for 2025 Market Rates
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            onClick={handleNext} 
            disabled={loading}
            className="h-16 px-14 rounded-2xl text-white font-black text-lg shadow-2xl hover:shadow-pink-200/50 transition-all active:scale-95 group relative overflow-hidden"
            style={{ background: palette.brandGradient }}
          >
            <span className="relative z-10 flex items-center">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Save and Continue <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" /></>
              )}
            </span>
          </Button>
          
          <button 
            onClick={() => router.push('/creator/onboarding/details')}
            className="text-gray-400 hover:text-pink-500 font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Skip for now
          </button>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] mt-12 opacity-30">
          Powered by VisionMatch Intelligence
        </p>
      </div>
    </div>
  );
}