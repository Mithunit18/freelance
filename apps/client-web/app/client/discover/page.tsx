'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Star, MapPin, Heart, X, Loader, Camera, Video, Users, 
  Sparkles, Filter, ChevronDown, Grid3X3, LayoutGrid, ArrowRight, Check, 
  TrendingUp, Zap, Award, Clock
} from 'lucide-react';
import Link from 'next/link';
import { fetchCreators } from '@/services/fetchCreators';
import { Auth } from '@/services/Auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { cn } from '@vision-match/utils-js';
import { palette, themeClasses } from '@/utils/theme';

type Creator = {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  specialisation?: string;
  bio?: string;
  profileImage?: string;
  profile_photo?: string;
  location?: {
    city?: string;
    country?: string;
  };
  city?: string;
  operating_locations?: string[];
  travel_available?: boolean;
  categories?: string[];
  tags?: string[];
  style_tags?: string[];
  years_experience?: number;
  experience?: string;
  languages?: string[];
  gear?: string[];
  starting_price?: number;
  price_unit?: string;
  currency?: string;
  negotiable?: boolean;
  price?: string;
  portfolioImages?: string[];
  portfolio_images?: string[];
  rating?: number;
  reviews?: number;
  verified?: boolean;
  verification_status?: string;
  profile_live?: boolean;
};

const categories = [
  { id: 'all', label: 'All Creators', icon: Users, color: 'from-pink-500 to-purple-500', bg: 'bg-gradient-to-r from-pink-500/10 to-purple-500/10' },
  { id: 'photographer', label: 'Photography', icon: Camera, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10' },
  { id: 'videographer', label: 'Videography', icon: Video, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/10' },
  { id: 'Wedding', label: 'Wedding', icon: Heart, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/10' },
  { id: 'Event', label: 'Event', icon: Sparkles, color: 'from-pink-500 to-purple-500', bg: 'bg-pink-500/10' },
  { id: 'Product', label: 'Product', icon: Camera, color: 'from-purple-500 to-blue-500', bg: 'bg-purple-500/10' },
];

const sortOptions = [
  { id: 'relevant', label: 'Most Relevant', icon: Zap },
  { id: 'rating', label: 'Highest Rated', icon: Star },
  { id: 'price-low', label: 'Price: Low to High', icon: TrendingUp },
  { id: 'experience', label: 'Most Experienced', icon: Award },
];

// Animated Counter
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 50;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Creator Card Component - Light Theme
const CreatorCard = ({ creator, index, favorites, toggleFavorite }: { 
  creator: Creator; 
  index: number;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group"
    >
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-100 hover:border-pink-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-100/50">
        {/* Verified Badge */}
        {creator.verified && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-emerald-500 backdrop-blur-sm text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-3.5 h-3.5" />
            Verified Pro
          </motion.div>
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
          
          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(creator.id)}
            className={cn(
              "absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg",
              favorites.includes(creator.id)
                ? "bg-pink-500 text-white shadow-pink-500/30"
                : "bg-white/90 text-gray-600 hover:bg-pink-500 hover:text-white border border-gray-200"
            )}
          >
            <Heart className={cn("h-5 w-5", favorites.includes(creator.id) && "fill-current")} />
          </motion.button>

          {/* Category Tags */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {(creator.categories?.length ? creator.categories : creator.tags)?.slice(0, 2).map((item) => (
              <span 
                key={item} 
                className="text-xs font-medium bg-white/90 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-full border border-white/50 shadow-sm"
              >
                {item}
              </span>
            )) || (
              <span className="text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                {creator.role ? creator.role.charAt(0).toUpperCase() + creator.role.slice(1) : 'Creator'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-pink-500 transition-colors">
                {creator.name || creator.full_name || 'Creator'}
              </h3>
              <p className="text-sm text-gray-500">
                {creator.specialisation || (creator.role ? creator.role.charAt(0).toUpperCase() + creator.role.slice(1) : 'Creative Professional')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-amber-600">
                {creator.rating?.toFixed(1) || 'New'}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <MapPin className="h-4 w-4 text-pink-500" />
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
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                {creator.years_experience}+ years
              </span>
            )}
            {creator.languages?.slice(0, 2).map((lang) => (
              <span key={lang} className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full capitalize">
                {lang}
              </span>
            ))}
          </div>

          {/* Price */}
          {(creator.starting_price || creator.price) && (
            <div className="mb-5 pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Starting from</span>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {creator.price || `${creator.currency || '₹'}${creator.starting_price?.toLocaleString()} ${creator.price_unit || ''}`}
              </span>
              {creator.negotiable && (
                <span className="ml-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Negotiable
                </span>
              )}
            </div>
          )}

          <Link 
            href={`/client/creator/${creator.id}`}
            className="group/btn relative block w-full text-center py-3.5 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-pink-200/50"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            />
            <span className="relative flex items-center justify-center gap-2">
              View Profile
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function DiscoverPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevant');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorList, setCreatorList] = useState<Creator[]>([]);
  
  const ITEMS_PER_ROW = 3;
  const ROWS_PER_LOAD = 2;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_ROW * ROWS_PER_LOAD);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  // Filter creators based on search and category
  const filteredCreators = creatorList.filter((creator) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      creator.name?.toLowerCase().includes(searchLower) ||
      creator.full_name?.toLowerCase().includes(searchLower) ||
      creator.city?.toLowerCase().includes(searchLower) ||
      creator.bio?.toLowerCase().includes(searchLower) ||
      creator.categories?.some(cat => cat.toLowerCase().includes(searchLower)) ||
      creator.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesCategory = activeCategory === 'all' || 
      creator.role?.toLowerCase() === activeCategory.toLowerCase() ||
      creator.categories?.some(cat => cat.toLowerCase() === activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        const user = await Auth.me();
        
        if (!user) {
           router.push("/login");
           return;
        }

        setLoading(true);
        const res = await fetchCreators();
        console.log("Fetched creators data:", res);
        setCreatorList(res || []);

      } catch (err: unknown) {
        console.error('Failed to initialize discover page', err);
        setError('Unable to load creators at this time.');
      } finally {
        setLoading(false);
        setIsAuthChecking(false);
      }
    };

    initPage();
  }, [router]);

  // Beautiful loading state
  if (isAuthChecking) {
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
          <p className="text-gray-700 font-medium text-lg">Discovering amazing creators...</p>
          <p className="text-gray-500 text-sm mt-2">This won't take long</p>
        </motion.div>
      </div>
    );
  }

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

      <main className="relative pt-24 pb-20">
        
        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative overflow-hidden py-16"
        >
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-6"
              >
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-semibold text-pink-600">AI-Powered Discovery</span>
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

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-8 mb-12"
            >
              {[
                { label: 'Verified Creators', value: 500, suffix: '+' },
                { label: 'Projects Completed', value: 2000, suffix: '+' },
                { label: 'Happy Clients', value: 1500, suffix: '+' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto mb-10"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition-opacity" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 p-2 shadow-xl shadow-gray-200/50">
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(
                        "p-4 rounded-xl transition-all duration-300",
                        showFilters 
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/50" 
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                      )}
                    >
                      <SlidersHorizontal className="h-5 w-5" />
                    </button>
                    <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 hover:scale-105 transition-all duration-300">
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
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "group flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300",
                    activeCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg shadow-pink-200/50`
                      : "bg-white/80 text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-gray-900"
                  )}
                >
                  <cat.icon className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    activeCategory === cat.id ? "text-white" : "text-gray-400 group-hover:text-pink-500"
                  )} />
                  {cat.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Results Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between mb-8 py-4 border-b border-gray-200"
          >
            <div>
              <p className="text-gray-600">
                <span className="text-2xl font-bold text-gray-900">{filteredCreators.length}</span>
                <span className="ml-2">creators found</span>
                {activeCategory !== 'all' && (
                  <span className="ml-2 text-pink-500 font-medium">
                    in {categories.find(c => c.id === activeCategory)?.label}
                  </span>
                )}
              </p>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
              >
                <span className="text-gray-400">Sort:</span>
                {sortOptions.find(s => s.id === sortBy)?.label}
                <ChevronDown className={cn("h-4 w-4 transition-transform", showSortDropdown && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { setSortBy(option.id); setShowSortDropdown(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors",
                          sortBy === option.id ? "text-pink-500 bg-pink-50" : "text-gray-600"
                        )}
                      >
                        <option.icon className="h-4 w-4" />
                        {option.label}
                        {sortBy === option.id && <Check className="h-4 w-4 ml-auto" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
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
              <div className="inline-block p-8 bg-red-50 rounded-3xl border border-red-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
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
              <div className="inline-block p-10 bg-white/80 rounded-3xl border border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-pink-500" />
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
                  <CreatorCard 
                    key={creator.id} 
                    creator={creator} 
                    index={index}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                  />
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
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white/80 border-2 border-gray-200 rounded-full font-semibold text-gray-700 hover:border-pink-300 hover:text-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span>Load More Creators</span>
                    <span className="px-3 py-1 bg-gray-100 group-hover:bg-pink-50 rounded-full text-sm text-gray-500 group-hover:text-pink-500 transition-colors">
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
                href="/client/wizard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="h-5 w-5 text-pink-500" />
                Start AI Matching
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © 2025 VisionMatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
