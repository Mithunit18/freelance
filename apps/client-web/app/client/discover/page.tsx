'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Star, MapPin, Heart, X, Loader, Camera, Video, Users, Sparkles, Filter, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react';
import { AppLayout, Footer, Button, cn } from '@vision-match/ui-web';
import Link from 'next/link';
import { Input } from '@vision-match/ui-web';
import { fetchCreators } from '@/services/fetchCreators';
import { verifySession } from '@/services/clientAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';

type Creator = {
  id: string;
  // Basic Info
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  specialisation?: string;
  bio?: string;
  
  // Images
  profileImage?: string;
  profile_photo?: string;
  
  // Location
  location?: {
    city?: string;
    country?: string;
  };
  city?: string;
  operating_locations?: string[];
  travel_available?: boolean;
  
  // Categories & Tags
  categories?: string[];
  tags?: string[];
  style_tags?: string[];
  
  // Experience
  years_experience?: number;
  experience?: string;
  languages?: string[];
  gear?: string[];
  
  // Pricing
  starting_price?: number;
  price_unit?: string;
  currency?: string;
  negotiable?: boolean;
  price?: string;
  
  // Portfolio
  portfolioImages?: string[];
  portfolio_images?: string[];
  
  // Stats
  rating?: number;
  reviews?: number;
  
  // Status
  verified?: boolean;
  verification_status?: string;
  profile_live?: boolean;
};

const categories = [
  { id: 'all', label: 'All Creators', icon: Users, color: 'from-pink-500 to-purple-500' },
  { id: 'photographer', label: 'Photography', icon: Camera, color: 'from-pink-500 to-rose-500' },
  { id: 'videographer', label: 'Videography', icon: Video, color: 'from-purple-500 to-indigo-500' },
  { id: 'Wedding', label: 'Wedding', icon: Heart, color: 'from-rose-500 to-pink-500' },
  { id: 'Event', label: 'Event', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
  { id: 'Product', label: 'Product', icon: Camera, color: 'from-emerald-500 to-teal-500' },
];

export default function DiscoverPage() {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorList, setCreatorList] = useState<Creator[]>([]);
  
  const ITEMS_PER_ROW = 3;
  const ROWS_PER_LOAD = 2;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_ROW * ROWS_PER_LOAD);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Filter creators based on search and category
  const filteredCreators = creatorList.filter((creator) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      creator.name?.toLowerCase().includes(searchLower) ||
      creator.full_name?.toLowerCase().includes(searchLower) ||
      creator.city?.toLowerCase().includes(searchLower) ||
      creator.bio?.toLowerCase().includes(searchLower) ||
      creator.categories?.some(cat => cat.toLowerCase().includes(searchLower)) ||
      creator.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    
    // Category filter
    const matchesCategory = activeCategory === 'all' || 
      creator.role?.toLowerCase() === activeCategory.toLowerCase() ||
      creator.categories?.some(cat => cat.toLowerCase() === activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        const user = await verifySession();
        
        if (!user) {
           router.push("/login");
           return;
        }

        setLoading(true);
        const res = await fetchCreators();
        console.log("Fetched creators data:", res);
        setCreatorList(res || []);

      } catch (err) {
        console.error('Failed to initialize discover page', err);
        setError('Unable to load creators at this time.');
      } finally {
        setLoading(false);
        setIsAuthChecking(false);
      }
    };

    initPage();
  }, [router]);

  // Full screen loader with beautiful animation
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-2xl opacity-30 rounded-full" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Finding amazing creators...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AppLayout
      navbar={<Header />}
      footer={<Footer />}
    >
      <main className="pt-28 pb-20 min-h-screen bg-gradient-to-b from-white via-pink-50/20 to-white">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 mb-6"
              >
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-semibold text-pink-600">AI-Powered Matching</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                Discover Creative
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Talent
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our curated collection of top photographers and videographers. Find the perfect match for your vision.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-20" />
                <div className="relative bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, style, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(
                        "p-4 rounded-xl transition-all duration-300",
                        showFilters 
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <SlidersHorizontal className="h-5 w-5" />
                    </button>
                    <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-300">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Category Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "group flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300",
                    activeCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg shadow-pink-500/20`
                      : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-600 shadow-sm"
                  )}
                >
                  <cat.icon className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    activeCategory === cat.id ? "text-white" : "text-gray-400 group-hover:text-pink-500"
                  )} />
                  {cat.label}
                </button>
              ))}
            </motion.div>

            {/* Results Count */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mb-8"
            >
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredCreators.length}</span> creators found
                {activeCategory !== 'all' && (
                  <span className="ml-2 text-sm text-pink-500">
                    in {categories.find(c => c.id === activeCategory)?.label}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-pink-300 transition-colors">
                  Most Relevant
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg">
                <Loader className="h-5 w-5 text-pink-500 animate-spin" />
                <span className="text-gray-600 font-medium">Loading amazing creators...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-8 bg-red-50 rounded-3xl border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCreators.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-block p-8 bg-gray-50 rounded-3xl">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No creators found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}

          {/* Creator Grid */}
          {!loading && !error && filteredCreators.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCreators.slice(0, visibleCount).map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-500 hover:-translate-y-2">
                      {/* Verified Badge */}
                      {creator.verified && (
                        <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </div>
                      )}
                      
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={creator.profileImage || creator.profile_photo || "/placeholder.jpg"}
                          alt={creator.name || creator.full_name || "Creator"}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.jpg";
                          }}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(creator.id)}
                          className={cn(
                            "absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all duration-300",
                            favorites.includes(creator.id)
                              ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                              : "bg-white/80 text-gray-600 hover:bg-pink-500 hover:text-white"
                          )}
                        >
                          <Heart className={cn("h-5 w-5", favorites.includes(creator.id) && "fill-current")} />
                        </button>

                        {/* Categories/Tags */}
                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                          {(creator.categories?.length ? creator.categories : creator.tags)?.slice(0, 2).map((item) => (
                            <span 
                              key={item} 
                              className="text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full"
                            >
                              {item}
                            </span>
                          )) || (
                            <span className="text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full">
                              {creator.role?.charAt(0).toUpperCase() + creator.role?.slice(1) || 'Creator'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-pink-600 transition-colors">
                              {creator.name || creator.full_name || 'Creator'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {creator.specialisation || creator.role?.charAt(0).toUpperCase() + creator.role?.slice(1) || 'Creative Professional'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold text-amber-700">
                              {creator.rating?.toFixed(1) || 'New'}
                            </span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-gray-500 mb-3">
                          <MapPin className="h-4 w-4 text-pink-400" />
                          <span className="text-sm">
                            {creator.city || creator.location?.city || 'Location not specified'}
                            {(creator.location?.country || creator.operating_locations?.length) && (
                              <span className="text-gray-400">
                                {creator.location?.country ? `, ${creator.location.country}` : ''}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Experience & Languages */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {creator.years_experience && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                              {creator.years_experience}+ years exp
                            </span>
                          )}
                          {creator.languages?.slice(0, 2).map((lang) => (
                            <span key={lang} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                              {lang}
                            </span>
                          ))}
                        </div>

                        {/* Price */}
                        {(creator.starting_price || creator.price) && (
                          <div className="mb-4 pb-4 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Starting from</span>
                            <span className="ml-2 text-lg font-bold text-gray-900">
                              {creator.price || `${creator.currency || '₹'}${creator.starting_price?.toLocaleString()} ${creator.price_unit || ''}`}
                            </span>
                            {creator.negotiable && (
                              <span className="ml-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Negotiable
                              </span>
                            )}
                          </div>
                        )}

                        <Link 
                          href={`/creator/${creator.id}`}
                          className="block w-full text-center py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all duration-300"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {visibleCount < filteredCreators.length && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-16"
                >
                  <button
                    onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_ROW * ROWS_PER_LOAD)}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 rounded-full font-semibold text-gray-700 hover:border-pink-400 hover:text-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span>Load More Creators</span>
                    <span className="px-3 py-1 bg-gray-100 group-hover:bg-pink-100 rounded-full text-sm text-gray-500 group-hover:text-pink-600 transition-colors">
                      {filteredCreators.length - visibleCount} more
                    </span>
                  </button>
                </motion.div>
              )}
            </>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-12 text-center"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Let our AI find the perfect creator match based on your specific project needs and style preferences.
              </p>
              <Link 
                href="/wizard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="h-5 w-5 text-pink-500" />
                Start AI Matching
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </AppLayout>
  );
}