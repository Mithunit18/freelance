"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Camera, Star, ArrowRight, UserCircle, Sparkles, LogOut, LayoutDashboard, 
  Loader2, CheckCircle2, Video, Briefcase, Users, Shield, 
  Heart, Zap, Globe, Award, ChevronRight, Play, Quote, MapPin,
  Clock, IndianRupee, Verified, MousePointer2, ArrowDown, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Auth } from "@/services/Auth"; 
import { toast } from "sonner";

// ============== PALETTE ==============
const palette = {
  pink: "#ec4899",
  pink600: "#db2777",
  pink400: "#f472b6",
  rose: "#f43f5e",
  purple: "#a855f7",
  purple600: "#9333ea",
  blue: "#3b82f6",
  blue600: "#2563eb",
  cyan: "#22d3ee",
  indigo: "#6366f1",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray800: "#1f2937",
  emerald: "#059669",
  yellow: "#eab308",
  bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
  brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
  ctaGradient: "linear-gradient(to right, #ec4899, #3b82f6)",
  pinkGradient: "linear-gradient(to right, #ec4899, #db2777)",
  blueGradient: "linear-gradient(to right, #3b82f6, #2563eb)",
  purpleGradient: "linear-gradient(to right, #a855f7, #9333ea)",
  cardGradient1: "linear-gradient(to bottom right, #f472b6, #f43f5e)",
  cardGradient2: "linear-gradient(to bottom right, #60a5fa, #6366f1)",
  cardGradient3: "linear-gradient(to bottom right, #c084fc, #f472b6)",
  cardGradient4: "linear-gradient(to bottom right, #22d3ee, #3b82f6)",
};

// ============== ANIMATED COUNTER ==============
const AnimatedCounter = ({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    const timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ============== FLOATING 3D CARD ==============
const Floating3DCard = ({ 
  src, 
  name,
  category,
  rating,
  price,
  position, 
  delay = 0,
}: { 
  src: string; 
  name: string;
  category: string;
  rating: number;
  price: string;
  position: string; 
  delay?: number;
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className={`absolute ${position} z-20 hidden xl:block`}
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setRotateX((y - rect.height / 2) / 10);
          setRotateY((x - rect.width / 2) / 10);
        }}
        onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
        style={{ 
          transform: `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d"
        }}
        className="w-56 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 cursor-pointer hover:shadow-pink-200/50 transition-shadow duration-300"
      >
        <div className="relative h-36 overflow-hidden">
          <img src={src} alt={name} className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-xs font-bold">{rating}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-800 text-sm">{name}</h4>
            <Verified className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mb-3">{category}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Starting at</span>
            <span className="font-bold text-sm" style={{ color: palette.pink }}>{price}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============== TESTIMONIAL CARD ==============
const TestimonialCard = ({ 
  quote, 
  name, 
  role, 
  avatar, 
  rating,
  delay 
}: { 
  quote: string; 
  name: string; 
  role: string; 
  avatar: string;
  rating: number;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-100/30 transition-all duration-500"
  >
    <div className="absolute -top-4 -left-2 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: palette.pinkGradient }}>
      <Quote className="w-5 h-5 text-white" />
    </div>
    <div className="flex gap-1 mb-4 mt-2">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
    <p className="text-gray-600 leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
    <div className="flex items-center gap-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-pink-100" />
      <div>
        <h4 className="font-bold text-gray-800">{name}</h4>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

// ============== CREATOR SHOWCASE CARD ==============
const CreatorShowcaseCard = ({ 
  image, 
  name, 
  specialty, 
  location, 
  rating, 
  projects,
  gradient,
  delay 
}: { 
  image: string; 
  name: string; 
  specialty: string; 
  location: string;
  rating: number;
  projects: number;
  gradient: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -8 }}
    className="group relative rounded-3xl overflow-hidden cursor-pointer"
  >
    <div className="aspect-[3/4] relative">
      <img src={image} alt={name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `${gradient}99` }} />
      
      {/* Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
        <Verified className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-semibold text-gray-800">Verified Pro</span>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-white text-lg">{name}</h3>
        </div>
        <p className="text-white/80 text-sm mb-3">{specialty}</p>
        <div className="flex items-center gap-4 text-white/70 text-xs">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {rating}
          </span>
          <span className="flex items-center gap-1">
            <Camera className="w-3 h-3" /> {projects}+ projects
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

// ============== FEATURE CARD ADVANCED ==============
const FeatureCardAdvanced = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  delay,
  stats
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string;
  delay: number;
  stats?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
    className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 hover:border-transparent overflow-hidden transition-all duration-500"
  >
    {/* Gradient Border on Hover */}
    <div 
      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: gradient, padding: '2px' }}
    />
    <div className="absolute inset-[2px] bg-white rounded-[22px]" />
    
    <div className="relative z-10">
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300"
        style={{ background: gradient }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed mb-4">{description}</p>
      {stats && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-600">{stats}</span>
        </div>
      )}
    </div>
  </motion.div>
);

// ============== ROLE CARD ADVANCED ==============
const RoleCardAdvanced = ({ 
  icon: Icon, 
  title, 
  description, 
  features, 
  gradient, 
  buttonText,
  onClick,
  delay,
  popular
}: { 
  icon: any; 
  title: string; 
  description: string; 
  features: string[];
  gradient: string;
  buttonText: string;
  onClick: () => void;
  delay: number;
  popular?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className={`group relative bg-white rounded-[2rem] p-10 border ${popular ? 'border-pink-300 shadow-2xl shadow-pink-100/50' : 'border-gray-100'} hover:shadow-2xl transition-all duration-500 overflow-hidden`}
  >
    {popular && (
      <div className="absolute -top-px left-1/2 -translate-x-1/2">
        <div className="px-4 py-1.5 text-xs font-bold text-white rounded-b-xl" style={{ background: palette.pinkGradient }}>
          MOST POPULAR
        </div>
      </div>
    )}
    
    {/* Decorative Elements */}
    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: palette.pink }} />
    
    <div 
      className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-105 transition-transform duration-300"
      style={{ background: gradient }}
    >
      <Icon className="w-10 h-10 text-white" />
    </div>
    
    <h3 className="text-3xl font-black text-gray-800 mb-4">{title}</h3>
    <p className="text-gray-500 text-lg mb-8 leading-relaxed">{description}</p>
    
    <ul className="space-y-4 mb-10">
      {features.map((feature, idx) => (
        <motion.li 
          key={idx} 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: delay + (idx * 0.1) }}
          className="flex items-center gap-4 text-gray-600"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${gradient}20` }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: palette.emerald }} />
          </div>
          <span>{feature}</span>
        </motion.li>
      ))}
    </ul>
    
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full py-5 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group/btn text-lg"
      style={{ background: gradient }}
    >
      {buttonText}
      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
    </motion.button>
  </motion.div>
);

// ============== STATS SECTION ==============
const StatsSection = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
    {[
      { value: 500, suffix: "+", label: "Verified Creators", icon: Users },
      { value: 2000, suffix: "+", label: "Projects Delivered", icon: Camera },
      { value: 98, suffix: "%", label: "Client Satisfaction", icon: Heart },
      { value: 50, suffix: "+", label: "Cities Covered", icon: Globe },
    ].map((stat, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100"
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: palette.bgGradient }}>
          <stat.icon className="w-6 h-6" style={{ color: palette.pink }} />
        </div>
        <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text mb-2" style={{ backgroundImage: palette.brandGradient }}>
          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
        </div>
        <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
      </motion.div>
    ))}
  </div>
);

// ============== MARQUEE COMPONENT ==============
const MarqueeLogos = () => {
  const categories = [
    "Wedding Photography", "Pre-Wedding Shoots", "Corporate Events", "Product Photography",
    "Fashion Shoots", "Real Estate", "Food Photography", "Portrait Sessions",
    "Cinematic Videos", "Documentary Films", "Music Videos", "Ad Films"
  ];

  return (
    <div className="overflow-hidden py-8 bg-white/50 border-y border-gray-100">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap"
      >
        {[...categories, ...categories].map((cat, idx) => (
          <div key={idx} className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-gray-100 shadow-sm">
            <Sparkles className="w-4 h-4" style={{ color: palette.pink }} />
            <span className="text-gray-600 font-medium">{cat}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ============== MOBILE MENU ==============
const MobileMenu = ({ isOpen, onClose, user, onLogout, router }: any) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <div className="mt-12 space-y-4">
            <a href="#how-it-works" onClick={onClose} className="block py-3 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">How It Works</a>
            <a href="#creators" onClick={onClose} className="block py-3 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">For Creators</a>
            <a href="#clients" onClick={onClose} className="block py-3 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">For Clients</a>
            <a href="#testimonials" onClick={onClose} className="block py-3 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Testimonials</a>
            <hr className="my-4" />
            {user ? (
              <>
                <button onClick={() => { router.push(user.role === 'client' ? '/client/wizard' : '/creator/onboarding'); onClose(); }} className="w-full py-3 px-4 rounded-xl text-left text-gray-600 hover:bg-gray-50 font-medium flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </button>
                <button onClick={() => { onLogout(); onClose(); }} className="w-full py-3 px-4 rounded-xl text-left text-red-500 hover:bg-red-50 font-medium flex items-center gap-3">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { router.push("/login"); onClose(); }} className="w-full py-3 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Sign In</button>
                <button onClick={() => { router.push("/signup"); onClose(); }} className="w-full py-4 rounded-xl font-bold text-white" style={{ background: palette.ctaGradient }}>Get Started</button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============== MAIN COMPONENT ==============
export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const floatingCreators = [
    { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop", name: "Arjun Mehta", category: "Wedding Photographer", rating: 4.9, price: "₹25,000", position: "left-[3%] top-[18%]", delay: 0.2 },
    { src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=600&fit=crop", name: "Priya Sharma", category: "Cinematic Videographer", rating: 4.8, price: "₹35,000", position: "right-[3%] top-[12%]", delay: 0.4 },
    { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop", name: "Rahul Kapoor", category: "Pre-Wedding Expert", rating: 5.0, price: "₹40,000", position: "left-[5%] bottom-[18%]", delay: 0.6 },
    { src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=600&fit=crop", name: "Sneha Patel", category: "Event Photographer", rating: 4.9, price: "₹20,000", position: "right-[5%] bottom-[22%]", delay: 0.8 },
  ];

  const showcaseCreators = [
    { image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop", name: "Aisha Khan", specialty: "Wedding & Pre-Wedding", location: "Mumbai", rating: 4.9, projects: 150, gradient: palette.cardGradient1 },
    { image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", name: "Vikram Singh", specialty: "Cinematic Films", location: "Delhi", rating: 4.8, projects: 120, gradient: palette.cardGradient2 },
    { image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop", name: "Maya Reddy", specialty: "Fashion & Portraits", location: "Bangalore", rating: 5.0, projects: 200, gradient: palette.cardGradient3 },
    { image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", name: "Rohan Desai", specialty: "Corporate Events", location: "Pune", rating: 4.9, projects: 180, gradient: palette.cardGradient4 },
  ];

  const testimonials = [
    { quote: "VisionMatch helped us find the perfect photographer for our wedding. The AI matching was spot-on with our style preferences!", name: "Priya & Arjun", role: "Wedding Couple, Mumbai", avatar: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=100&h=100&fit=crop", rating: 5 },
    { quote: "As a photographer, this platform has transformed my business. I get matched with clients who truly appreciate my style.", name: "Vikram Malhotra", role: "Wedding Photographer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", rating: 5 },
    { quote: "The escrow system gave us complete peace of mind. Professional service from start to finish!", name: "Anjali Sharma", role: "Corporate Client, Delhi", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", rating: 5 },
  ];

  const features = [
    { icon: Sparkles, title: "AI-Powered Matching", description: "Our intelligent algorithm analyzes your style preferences and matches you with creators whose work resonates with your vision.", gradient: palette.pinkGradient, stats: "95% match accuracy" },
    { icon: Shield, title: "Secure Escrow Payments", description: "Your money is held safely until you're completely satisfied with the delivered work. No risks, only results.", gradient: palette.blueGradient, stats: "100% secure transactions" },
    { icon: Verified, title: "Verified Professionals", description: "Every creator undergoes thorough ID verification and portfolio review before joining our platform.", gradient: palette.purpleGradient, stats: "All creators verified" },
    { icon: Zap, title: "Instant Booking", description: "Skip the endless back-and-forth. Book your perfect creator in just a few clicks with real-time availability.", gradient: palette.pinkGradient, stats: "Book in under 5 mins" },
    { icon: Heart, title: "Visual Style Profiling", description: "Our unique taste picker helps us understand your aesthetic preferences through images you love.", gradient: palette.purpleGradient, stats: "30+ style attributes" },
    { icon: Globe, title: "Pan-India Network", description: "Access talented creators from 50+ cities. Local expertise, national reach.", gradient: palette.blueGradient, stats: "50+ cities covered" },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await Auth.me();
        if (data && data.user) setUser(data.user);
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
    } catch (err) {
      toast.error("Logout failed", { id: t });
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: palette.bgGradient }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[250px] opacity-10" style={{ backgroundColor: palette.purple }} />
      </div>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
        style={{ scaleX: scrollYProgress, background: palette.brandGradient }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 px-4 md:px-6 py-4 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50" style={{ background: palette.ctaGradient }}>
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-gray-800">
              Vision<span style={{ color: palette.pink }}>Match</span>
            </span>
          </motion.div>
          
          <div className="hidden lg:flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-full">
            <a href="#" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all" style={{ background: palette.gray800 }}>Home</a>
            <a href="#how-it-works" className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-all">How It Works</a>
            <a href="#creators" className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-all">Creators</a>
            <a href="#testimonials" className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-all">Reviews</a>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : user ? (
              <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 px-3 py-1">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      <UserCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-none mb-0.5">Welcome</p>
                    <p className="text-sm font-bold text-gray-800 leading-none">{user.email?.split('@')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => router.push(user.role === 'client' ? '/client/wizard' : '/creator/onboarding')} className="p-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                  <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/login")} className="font-semibold text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
                <Button onClick={() => router.push("/signup")} className="rounded-xl px-6 font-bold text-white shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 hover:scale-105 transition-all" style={{ background: palette.ctaGradient }}>
                  Get Started
                </Button>
              </div>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} onLogout={handleLogout} router={router} />

      {/* Hero Section */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 min-h-[95vh] flex items-center">
        {floatingCreators.map((creator, idx) => (
          <Floating3DCard key={idx} {...creator} />
        ))}

        <div className="relative z-30 px-4 md:px-6 py-16 md:py-24 w-full">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-pink-200 bg-white/90 backdrop-blur-sm mb-8 shadow-lg shadow-pink-100/50"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
              <span className="text-sm font-bold text-pink-600">India&apos;s #1 Creative Marketplace</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight text-gray-900 mb-8"
            >
              Find Your Perfect<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                Creative Partner
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-500 mb-12"
            >
              AI-powered matching connects you with <span className="font-bold text-pink-500">elite photographers</span> and{" "}
              <span className="font-bold text-purple-500">videographers</span> who match your unique style
            </motion.p>

            {/* Dual CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg"
                  onClick={() => router.push("/signup")}
                  className="h-16 px-10 rounded-2xl text-lg font-bold text-white shadow-2xl shadow-pink-300/50 transition-all group"
                  style={{ background: palette.pinkGradient }}
                >
                  <Briefcase className="w-6 h-6 mr-3" />
                  I&apos;m Looking to Hire
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg"
                  onClick={() => router.push("/signup")}
                  className="h-16 px-10 rounded-2xl text-lg font-bold text-white shadow-2xl shadow-blue-300/50 transition-all group"
                  style={{ background: palette.blueGradient }}
                >
                  <Camera className="w-6 h-6 mr-3" />
                  I&apos;m a Creator
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Verified className="w-5 h-5 text-blue-500" />
                <span>Verified Creators</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span>4.9/5 Average Rating</span>
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ delay: 1, duration: 2, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-gray-400"
            >
              <span className="text-xs font-medium">Scroll to explore</span>
              <ArrowDown className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Marquee */}
      <MarqueeLogos />

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <StatsSection />
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="clients" className="relative z-10 py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50/80 text-purple-600 text-sm font-bold mb-6">
              <MousePointer2 className="w-4 h-4" />
              CHOOSE YOUR PATH
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              How Will You Use{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>VisionMatch</span>?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl">
              Whether you&apos;re capturing memories or creating them, we&apos;ve built the perfect platform for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <RoleCardAdvanced
              icon={Briefcase}
              title="I'm a Client"
              description="Looking for photographers or videographers for your special moments? Let AI find your perfect creative match."
              features={[
                "AI-powered style matching",
                "Verified creator portfolios",
                "Secure escrow payments",
                "Direct messaging system",
                "Project management tools"
              ]}
              gradient={palette.pinkGradient}
              buttonText="Find My Creator"
              onClick={() => router.push("/signup")}
              delay={0.2}
              popular
            />
            <RoleCardAdvanced
              icon={Camera}
              title="I'm a Creator"
              description="Showcase your photography or videography skills to clients actively searching for your unique talent."
              features={[
                "Get matched with ideal projects",
                "Build your verified profile",
                "Set your own pricing",
                "Protected payments",
                "Grow your reputation"
              ]}
              gradient={palette.blueGradient}
              buttonText="Join as Creator"
              onClick={() => router.push("/signup")}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="relative z-10 py-20 md:py-32 px-4 md:px-6 bg-white/30 scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-200 bg-pink-50/80 text-pink-600 text-sm font-bold mb-6">
              <Zap className="w-4 h-4" />
              WHY VISIONMATCH
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Features That Set Us{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Apart</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl">
              Built with cutting-edge technology to deliver the best creative matching experience.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <FeatureCardAdvanced key={idx} {...feature} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Creator Showcase */}
      <section id="creators" className="relative z-10 py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50/80 text-blue-600 text-sm font-bold mb-6">
              <Award className="w-4 h-4" />
              TOP CREATORS
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Meet Our{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Star Creators</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl">
              Discover talented professionals who are ready to bring your vision to life.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseCreators.map((creator, idx) => (
              <CreatorShowcaseCard key={idx} {...creator} delay={idx * 0.1} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              size="lg"
              onClick={() => router.push("/signup")}
              className="h-14 px-8 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              style={{ background: palette.brandGradient }}
            >
              Explore All Creators
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-20 md:py-32 px-4 md:px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-200 bg-yellow-50/80 text-yellow-600 text-sm font-bold mb-6">
              <Star className="w-4 h-4 fill-yellow-500" />
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Loved by{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Thousands</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl">
              See what our clients and creators have to say about their VisionMatch experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} {...testimonial} delay={idx * 0.2} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 md:py-32 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div 
            className="rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden"
            style={{ background: palette.brandGradient }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-30 bg-white" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[100px] opacity-20 bg-white" />
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", damping: 10 }}
              >
                <Award className="w-20 h-20 text-white/90 mx-auto mb-8" />
              </motion.div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of clients and creators already using VisionMatch to bring creative visions to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg"
                    onClick={() => router.push("/signup")}
                    className="h-16 px-10 rounded-2xl text-lg font-bold bg-white text-gray-900 hover:bg-gray-100 shadow-2xl transition-all"
                  >
                    Create Free Account
                    <ChevronRight className="w-6 h-6 ml-2" />
                  </Button>
                </motion.div>
              </div>
              <p className="text-white/60 text-sm mt-6">No credit card required • Free to get started</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-4 md:px-6 border-t border-gray-200 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50" style={{ background: palette.ctaGradient }}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-gray-800">
                  Vision<span style={{ color: palette.pink }}>Match</span>
                </span>
              </div>
              <p className="text-gray-500 mb-6 max-w-sm">
                India&apos;s premier AI-powered marketplace connecting clients with elite photographers and videographers.
              </p>
              <div className="flex gap-3">
                {['twitter', 'instagram', 'linkedin', 'youtube'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Platform</h4>
              <ul className="space-y-3">
                {['How It Works', 'For Clients', 'For Creators', 'Pricing', 'FAQs'].map((link) => (
                  <li key={link}><a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Contact', 'Press'].map((link) => (
                  <li key={link}><a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 VisionMatch. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
