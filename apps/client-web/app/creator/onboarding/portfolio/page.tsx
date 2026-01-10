"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, X, Check, Loader2, Camera, Sparkles, Image as ImageIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Import the centralized service
import { portfolioService } from '@/services/onboarding';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const CATEGORIES = ['Wedding', 'Pre-wedding', 'Event', 'Corporate', 'Fashion', 'Product', 'Portrait', 'Landscape'];
const STYLE_TAGS = ['Cinematic', 'Natural', 'Bright & Airy', 'Moody', 'Documentary', 'Vintage', 'Modern', 'Artistic'];

export default function PortfolioSetupPage() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Brand Palette
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
    const fetchPortfolio = async () => {
      try {
        const data = await portfolioService.get();
        if (data) {
          setProfilePhoto(data.profile_photo || null);
          setPortfolioImages(data.portfolio_images || []);
          setSelectedCategories(data.categories || []);
          setSelectedStyles(data.style_tags || []);
        }
      } catch (error) {
        console.log("No existing portfolio found.");
      } finally {
        setFetching(false);
      }
    };
    fetchPortfolio();
  }, []);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading("Uploading profile photo...");
    try {
      const res = await portfolioService.uploadImage(file);
      setProfilePhoto(res.url);
      toast.success("Profile photo updated", { id: loadingToast });
    } catch (error) {
      toast.error("Upload failed", { id: loadingToast });
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const loadingToast = toast.loading(`Uploading ${files.length} images...`);
    try {
      const uploadPromises = files.map(file => portfolioService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);
      setPortfolioImages(prev => [...prev, ...urls].slice(0, 20));
      toast.success("Gallery updated", { id: loadingToast });
    } catch (error) {
      toast.error("Some images failed", { id: loadingToast });
    }
  };

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = async () => {
    if (!profilePhoto) return toast.error('Please upload a profile photo');
    if (portfolioImages.length < 5) return toast.error('Upload at least 5 images');
    if (selectedCategories.length === 0) return toast.error('Select a category');
    if (selectedStyles.length === 0) return toast.error('Select a style');

    setLoading(true);
    try {
      await portfolioService.setup({
        profile_photo: profilePhoto,
        portfolio_images: portfolioImages,
        portfolio_videos: [],
        categories: selectedCategories,
        style_tags: selectedStyles
      });
      toast.success('Portfolio saved!');
      router.push('/creator/onboarding/pricing');
    } catch (error: any) {
      toast.error('Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f9fafb]">
      <Loader2 className="animate-spin w-10 h-10" style={{ color: palette.purple }} />
      <p className="mt-4 font-medium text-gray-500">Loading your creative space...</p>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: palette.bgGradient }}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm" style={{ color: palette.pink }}>
              <Sparkles className="w-3 h-3" /> Step 1: Visual Identity
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Portfolio <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Setup</span></h1>
            <p className="text-gray-500 mt-2">Introduce yourself to clients with your best work.</p>
          </motion.div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 min-w-60">
            <div className="flex justify-between text-xs font-bold mb-2 text-gray-400">
              <span>GALLERY COMPLETION</span>
              <span style={{ color: palette.blue }}>{portfolioImages.length}/5 MIN</span>
            </div>
            <Progress value={(portfolioImages.length / 5) * 100} className="h-2" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Section */}
          <Card className="p-8 bg-white/70 backdrop-blur-xl border-white rounded-4xl shadow-sm flex flex-col items-center text-center h-fit">
            <h3 className="font-bold text-gray-800 mb-6">Profile Portrait</h3>
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                {profilePhoto ? (
                  <img src={profilePhoto} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-1 right-1 p-3 rounded-full bg-white shadow-lg cursor-pointer hover:scale-110 transition-transform text-primary border border-gray-50">
                <Camera className="w-5 h-5" style={{ color: palette.purple }} />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-6 leading-relaxed">Upload a clear, professional photo of yourself to build immediate trust with clients.</p>
          </Card>

          {/* Gallery Section */}
          <Card className="lg:col-span-2 p-8 bg-white/70 backdrop-blur-xl border-white rounded-4xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800">Work Gallery</h3>
              <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">{portfolioImages.length} / 20 Images</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AnimatePresence>
                {portfolioImages.map((img, idx) => (
                  <motion.div 
                    key={img} 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm"
                  >
                    <img src={img} className="w-full h-full object-cover" alt="Work" />
                    <button 
                      onClick={() => setPortfolioImages(prev => prev.filter(i => i !== img))}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {portfolioImages.length < 20 && (
                <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group">
                  <div className="p-3 bg-gray-50 rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
                </label>
              )}
            </div>
          </Card>

          {/* Tags Section */}
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-white/70 backdrop-blur-xl border-white rounded-[2.5rem] shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.blue }} /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      selectedCategories.includes(cat) 
                        ? 'text-white border-transparent shadow-md' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                    }`}
                    style={{ backgroundColor: selectedCategories.includes(cat) ? palette.blue : undefined }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-white/70 backdrop-blur-xl border-white rounded-[2.5rem] shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.purple }} /> Visual Styles
              </h3>
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map(style => (
                  <button
                    key={style}
                    onClick={() => toggleItem(selectedStyles, setSelectedStyles, style)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      selectedStyles.includes(style) 
                        ? 'text-white border-transparent shadow-md' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200'
                    }`}
                    style={{ backgroundColor: selectedStyles.includes(style) ? palette.purple : undefined }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/creator/onboarding')} className="text-gray-400">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to start
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="h-12 px-10 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95 group"
            style={{ background: palette.brandGradient }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Continue to Pricing <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}