'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Camera,
  Award,
  CheckCircle,
  ArrowLeft,
  Heart,
  Share2,
  Package,
  Shield,
  Calendar,
  Clock,
  Globe,
  MessageCircle,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader,
  Users,
  Zap,
  Languages,
  Briefcase,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { getCreator } from '@/services/creatorProfile';
import { Header } from '@/components/layout/Header';
import { cn } from '@vision-match/utils-js';
import { palette, themeClasses } from '@/utils/theme';

export type CreatorPackage = {
  id?: string;
  name: string;
  price: string;
  duration: string;
  deliverables?: string[];
  popular?: boolean;
};

export type Creator = {
  id: string;
  name?: string;
  full_name?: string;
  role?: string;
  profileImage?: string;
  profile_photo?: string;
  specialisation?: string;
  rating?: number;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
  };
  city?: string;
  tags?: string[];
  style_tags?: string[];
  verified?: boolean;
  verification_status?: string;
  experience?: string;
  years_experience?: number;
  completedProjects?: number;
  reviews?: {
    userId: string;
    rating: number;
    comment?: string;
  }[];
  portfolioImages?: string[];
  portfolio_images?: string[];
  gear?: string[];
  gear_list?: string[];
  packages?: CreatorPackage[];
  languages?: string[];
  starting_price?: number;
  price_unit?: string;
  currency?: string;
  negotiable?: boolean;
  categories?: string[];
  operating_locations?: string[];
  travel_available?: boolean;
};

const NA = "Not available";

// Portfolio Image Gallery - Light Theme
const PortfolioGallery = ({ images, name }: { images: string[]; name: string }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group shadow-lg shadow-gray-200/50"
            onClick={() => setSelectedImage(index)}
          >
            <img 
              src={img} 
              alt={`${name}'s work ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-900">View</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedImage(Math.max(0, selectedImage - 1)); }}
              className="absolute left-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedImage(Math.min(images.length - 1, selectedImage + 1)); }}
              className="absolute right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
            
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[selectedImage]}
              alt={`${name}'s work`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-6 text-center text-white/60 text-sm">
              {selectedImage + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function useCreatorData(id: string | undefined) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const fetchCreatordata = useCallback(async (creatorId: string) => {
    setLoading(true);
    setError(null);
    setCreator(null);

    try {
      const creatorData = await getCreator(creatorId);

      if (!creatorData) {
        setError("Creator not found");
        setCreator(null);
      } else {
        setCreator(creatorData);
      }
    } catch (err) {
      console.error("Failed to fetch creator:", err);
      setError("Unable to load creator details due to a network or server error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCreatordata(id);
    } else {
      setLoading(false);
      setError("No creator ID provided.");
    }
  }, [id, fetchCreatordata]);

  return { creator, loading, error };
}


export default function CreatorProfilePage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { creator, loading, error } = useCreatorData(id);

  // Loading state - Light Theme
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-3xl opacity-20 rounded-full" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-200/50">
              <Loader className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading creator profile...</p>
          <p className="text-gray-500 text-sm mt-2">This won't take long</p>
        </motion.div>
      </div>
    );
  }

  // Error state - Light Theme
  if (error || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-xl"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "Creator profile could not be loaded."}</p>
          <button
            onClick={() => router.push('/client/discover')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-pink-200/50 transition-all"
          >
            Back to Discover
          </button>
        </motion.div>
      </div>
    );
  }

  // Helper to get display values
  const displayName = creator.name || creator.full_name || 'Creator';
  const displayImage = creator.profileImage || creator.profile_photo || '/placeholder.jpg';
  const displayCity = creator.city || creator.location?.city || '';
  const displayCountry = creator.location?.country || 'India';
  const displayLocation = displayCity ? `${displayCity}, ${displayCountry}` : NA;
  const displaySpecialisation = creator.specialisation || (creator.role ? creator.role.charAt(0).toUpperCase() + creator.role.slice(1) : NA);
  const displayExperience = creator.experience || (creator.years_experience ? `${creator.years_experience} years` : '—');
  const displayTags = creator.tags?.length ? creator.tags : (creator.style_tags?.length ? creator.style_tags : []);
  const displayPortfolio = creator.portfolioImages?.length ? creator.portfolioImages : (creator.portfolio_images?.length ? creator.portfolio_images : []);
  const displayGear = creator.gear?.length ? creator.gear : (creator.gear_list?.length ? creator.gear_list : []);
  const isVerified = creator.verified || creator.verification_status === 'verified';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Animated Background Elements - Fixed position like landing page */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 h-[800px] w-[800px] rounded-full opacity-30"
        style={{ background: palette.pink, filter: "blur(180px)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-32 -right-32 h-[800px] w-[800px] rounded-full opacity-30"
        style={{ background: palette.blue, filter: "blur(180px)" }}
      />
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: palette.purple, filter: "blur(200px)" }}
      />
      
      <Header />

      <main className="relative pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href="/client/discover" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to discover
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Hero Section - Light Theme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-200/50"
              >
                {/* Cover gradient */}
                <div className="h-36 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 relative">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Profile Image */}
                    <div className="relative -mt-24 sm:-mt-20">
                      <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-white bg-gray-100 shadow-2xl shadow-pink-200/30">
                        <img 
                          src={displayImage} 
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isVerified && (
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                              {displayName}
                            </h1>
                            {isVerified && (
                              <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                                ✓ Verified Pro
                              </span>
                            )}
                          </div>
                          <p className="text-lg text-gray-500 mb-4">
                            {displaySpecialisation}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                              <span className="text-gray-900 font-semibold">
                                {creator.rating?.toFixed(1) ?? "New"}
                              </span>
                              <span className="text-gray-500">
                                ({creator.reviews?.length ?? 0} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPin className="h-4 w-4 text-pink-500" />
                              {displayLocation}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={cn(
                              "p-3 rounded-xl transition-all shadow-lg",
                              isFavorite
                                ? "bg-pink-500 text-white shadow-pink-200/50"
                                : "bg-white text-gray-500 hover:bg-pink-500 hover:text-white border border-gray-200"
                            )}
                          >
                            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-xl bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 transition-all shadow-lg"
                          >
                            <Share2 className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Info Tags */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                    {creator.languages?.length ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                        <Languages className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-700 font-medium capitalize">
                          {creator.languages.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    ) : null}
                    {creator.travel_available && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
                        <Globe className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-purple-700 font-medium">Available for Travel</span>
                      </div>
                    )}
                    {creator.starting_price && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-xl">
                        <Briefcase className="h-4 w-4 text-pink-500" />
                        <span className="text-sm font-medium">
                          <span className="text-pink-600">From ₹{creator.starting_price.toLocaleString()}</span>
                          <span className="text-pink-400">/{creator.price_unit || 'project'}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards - Light Theme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { icon: Award, label: 'Experience', value: displayExperience, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                  { icon: Camera, label: 'Projects', value: creator.completedProjects ? `${creator.completedProjects}+` : "—", color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { icon: Users, label: 'Reviews', value: creator.reviews?.length || "0", color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', border: 'border-pink-200' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={cn(
                      "p-5 backdrop-blur-sm rounded-2xl border text-center group hover:shadow-lg transition-all",
                      stat.bg, stat.border
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg",
                      stat.color
                    )}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* About Section - Light Theme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {creator.bio || "No description available"}
                </p>

                {/* Categories */}
                {creator.categories?.length ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Specializes in</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-lg shadow-pink-200/30"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Style Tags */}
                {displayTags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Style</p>
                    <div className="flex flex-wrap gap-2">
                      {displayTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 rounded-full text-sm font-medium border border-pink-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Portfolio Section - Light Theme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-pink-500" />
                  Portfolio
                  {displayPortfolio.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-600 text-sm rounded-full">
                      {displayPortfolio.length} photos
                    </span>
                  )}
                </h2>
                
                {displayPortfolio.length > 0 ? (
                  <PortfolioGallery 
                    images={displayPortfolio} 
                    name={displayName} 
                  />
                ) : (
                  <div className="p-10 bg-white/60 rounded-2xl border border-gray-200 text-center">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Portfolio not available yet</p>
                  </div>
                )}
              </motion.div>

              {/* Equipment Section - Light Theme */}
              {displayGear.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Equipment & Gear
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {displayGear.map((item) => (
                      <span
                        key={item}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm border border-gray-200 capitalize"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Operating Locations */}
              {creator.operating_locations?.length ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Service Locations
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {creator.operating_locations.map((loc) => (
                      <span
                        key={loc}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm border border-blue-200 capitalize flex items-center gap-2"
                      >
                        <MapPin className="h-3 w-3" />
                        {loc}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* Packages Sidebar - Light Theme */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-28"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-500" />
                  Packages
                </h2>
                
                <div className="space-y-4">
                  {creator.packages?.length ? (
                    creator.packages.map((pkg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedPackage(index)}
                        className={cn(
                          "relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 shadow-lg",
                          selectedPackage === index
                            ? "bg-gradient-to-br from-pink-50 to-purple-50 border-pink-500 shadow-pink-200/50"
                            : "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-pink-300 shadow-gray-100/50",
                          pkg.popular && selectedPackage !== index && "border-purple-300"
                        )}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-pink-200/50">
                            Most Popular
                          </span>
                        )}
                        
                        <div className="flex items-baseline justify-between mb-4 mt-1">
                          <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            {pkg.price}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{pkg.duration}</span>
                        </div>
                        
                        <ul className="space-y-2">
                          {pkg.deliverables?.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        
                        {/* Selection indicator */}
                        {selectedPackage === index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-200/50"
                          >
                            <CheckCircle className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-6 bg-white/80 rounded-2xl border border-gray-200 text-center shadow-lg shadow-gray-100/50">
                      <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No packages available</p>
                      <p className="text-gray-400 text-sm mt-1">Contact for custom pricing</p>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  {selectedPackage !== null && creator.id !== undefined ? (
                    <Link 
                      href={`/client/request/${creator.id}?package=${selectedPackage}`}
                      className="group relative block w-full text-center py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-200/50 hover:-translate-y-0.5"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Request This Package
                      </span>
                    </Link>
                  ) : creator.id !== undefined ? (
                    <Link 
                      href={`/client/request/${creator.id}?type=inquiry`}
                      className="group relative block w-full text-center py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-200/50 hover:-translate-y-0.5"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Send Inquiry
                      </span>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 px-6 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed border border-gray-200"
                    >
                      Select a Package
                    </button>
                  )}
                  
                  <p className="text-center text-gray-500 text-sm mt-4">
                    You&apos;ll send a request, not an instant booking
                  </p>
                </motion.div>

                {/* Quick Contact Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
                >
                  <p className="text-sm text-gray-600 text-center mb-3">
                    💬 Have questions? Send a message to discuss your project details.
                  </p>
                  <Link 
                    href={`/client/request/${creator.id}?type=inquiry`}
                    className="block w-full text-center py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-pink-300 transition-all text-sm"
                  >
                    Start a Conversation
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Light Theme */}
      <footer className="border-t border-gray-200 py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold">VisionMatch</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
