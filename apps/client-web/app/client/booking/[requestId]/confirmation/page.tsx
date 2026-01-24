'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Calendar, MapPin, Camera, User, Download,
  Share2, MessageCircle, Clock, ArrowRight, Sparkles,
  FileText, Bell, Shield, Loader, Home, Star, Package
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { verifySession } from '@/services/clientAuth';
import { getRequest } from '@/services/creatorProfile';
import { cn } from '@vision-match/utils-js';
import { toast } from 'react-hot-toast';
import { palette, themeClasses } from '@/utils/theme';

// Floating background orb - LIGHT THEME
const FloatingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={cn("absolute rounded-full blur-3xl opacity-10 pointer-events-none", className)}
    animate={{
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

// Confetti particle component
const ConfettiParticle = ({ delay, index }: { delay: number; index: number }) => {
  const colors = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];
  const color = colors[index % colors.length];
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      style={{ 
        backgroundColor: color,
        left: `${startX}%`,
        top: 0,
      }}
      initial={{ y: -20, opacity: 1, scale: 1 }}
      animate={{ 
        y: '100vh', 
        opacity: 0, 
        scale: 0.5,
        x: `${endX - startX}vw`,
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
      }}
      transition={{ 
        duration: 3 + Math.random() * 2, 
        delay,
        ease: "easeOut",
      }}
    />
  );
};

type BookingDetails = {
  id: string;
  bookingId: string;
  creatorId: string;
  creatorName: string;
  creatorImage?: string;
  creatorRole?: string;
  projectType: string;
  eventDate: string;
  eventTime?: string;
  location: string;
  totalPaid: number;
  deliverables: string;
  status: string;
};

// Timeline step component - LIGHT THEME
const TimelineStep = ({ 
  step, 
  title, 
  description, 
  isCompleted, 
  isCurrent 
}: { 
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
        isCompleted 
          ? "bg-gradient-to-br from-emerald-500 to-green-600 border-transparent" 
          : isCurrent
          ? "bg-white border-pink-500"
          : "bg-gray-100 border-gray-200"
      )}>
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-white" />
        ) : (
          <span className={cn(
            "text-sm font-bold",
            isCurrent ? "text-pink-500" : "text-gray-400"
          )}>{step}</span>
        )}
      </div>
      <div className={cn(
        "w-0.5 h-full mt-2",
        isCompleted ? "bg-emerald-300" : "bg-gray-200"
      )} />
    </div>
    <div className="pb-8">
      <h4 className={cn(
        "font-semibold mb-1",
        isCompleted ? "text-emerald-600" : isCurrent ? "text-gray-900" : "text-gray-400"
      )}>{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export default function BookingConfirmationPage() {
  const router = useRouter();
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;
  
  // States
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on load
  useEffect(() => {
    if (!loading && bookingDetails) {
      setShowConfetti(true);
      // Hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [loading, bookingDetails]);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await verifySession();
        if (!user) {
          router.push('/login');
          return;
        }
        setClientId(user.id || user._id);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch booking details
  const fetchBookingDetails = useCallback(async () => {
    if (!requestId) return;
    
    try {
      setLoading(true);
      const data = await getRequest(requestId);
      
      if (data) {
        // Use finalOffer (accepted price) first, then currentOffer, then package price, budget, or starting_price
        // Parse package.price if it's a string like "₹50,000" or "50000"
        const parsePrice = (priceStr: string | number | undefined): number | null => {
          if (typeof priceStr === 'number') return priceStr;
          if (typeof priceStr === 'string') {
            const cleaned = priceStr.replace(/[₹,\s]/g, '').match(/\d+/);
            return cleaned ? parseInt(cleaned[0], 10) : null;
          }
          return null;
        };
        
        const packagePrice = parsePrice(data.package?.price);
        const budgetPrice = parsePrice(data.budget);
        const startingPrice = data.creator_starting_price || data.creatorStartingPrice;
        
        const baseAmount = data.final_offer?.price || data.finalOffer?.price ||
                          data.current_offer?.price || data.currentOffer?.price ||
                          packagePrice || budgetPrice || startingPrice || 25000;
        const platformFee = Math.round(baseAmount * 0.10);
        const gst = Math.round((baseAmount + platformFee) * 0.18);
        const finalAmount = baseAmount + platformFee + gst;
        
        setBookingDetails({
          id: data.id || data._id,
          bookingId: `VM-${Date.now().toString(36).toUpperCase()}`,
          creatorId: data.creator_id || data.creatorId,
          creatorName: data.creator_name || data.creatorName || 'Creator',
          creatorImage: data.creator_image || data.creatorImage,
          creatorRole: data.creator_role || data.creatorRole || 'Photographer',
          projectType: data.project_type || data.projectType || data.category || 'Photography',
          eventDate: data.event_date || data.eventDate || 'TBD',
          eventTime: data.event_time || data.eventTime,
          location: data.location || 'TBD',
          totalPaid: finalAmount,
          deliverables: data.current_offer?.deliverables || data.currentOffer?.deliverables || 'As discussed',
          status: 'confirmed',
        });
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (clientId && requestId) {
      fetchBookingDetails();
    }
  }, [clientId, requestId, fetchBookingDetails]);

  // Loading state
  if (isAuthChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-blue-50/30 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-3xl opacity-20 rounded-full" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-500/30">
              <Loader className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading confirmation...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-blue-50/30 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.1} index={i} />
          ))}
        </div>
      )}
      
      {/* Animated Background - Light Theme */}
      <FloatingOrb className="w-[500px] h-[500px] bg-emerald-400 -top-32 -left-32" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-pink-400 top-1/3 -right-32" delay={2} />
      <FloatingOrb className="w-[350px] h-[350px] bg-purple-400 bottom-0 left-1/4" delay={4} />
      
      {/* Grid pattern - Light */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <Header />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative inline-block mb-6"
            >
              {/* Celebration rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5 + ring * 0.3, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: ring * 0.3 }}
                />
              ))}
              
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Booking Confirmed!</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                You're All Set! 🎉
              </h1>
              <p className="text-gray-500 max-w-xl mx-auto">
                Your booking with {bookingDetails?.creatorName} has been confirmed. 
                We've sent confirmation details to your email.
              </p>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Booking Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Header with gradient */}
              <div className="p-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="text-xl font-bold text-gray-900">{bookingDetails?.bookingId}</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                    <span className="text-sm font-semibold text-emerald-700">Confirmed</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Creator Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {bookingDetails?.creatorImage ? (
                      <img 
                        src={bookingDetails.creatorImage}
                        alt={bookingDetails.creatorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900">{bookingDetails?.creatorName}</p>
                    <p className="text-gray-500">{bookingDetails?.creatorRole}</p>
                  </div>
                  <Link href={`/client/chat/${requestId}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-pink-600 hover:bg-pink-100 transition-all"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </motion.button>
                  </Link>
                </div>

                {/* Event Details */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Camera className="h-5 w-5 text-pink-500" />
                      <span className="text-sm text-gray-500">Project Type</span>
                    </div>
                    <p className="font-semibold text-gray-900">{bookingDetails?.projectType}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <span className="text-sm text-gray-500">Event Date</span>
                    </div>
                    <p className="font-semibold text-gray-900">{bookingDetails?.eventDate}</p>
                    {bookingDetails?.eventTime && (
                      <p className="text-sm text-gray-500">{bookingDetails.eventTime}</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-500">Location</span>
                    </div>
                    <p className="font-semibold text-gray-900">{bookingDetails?.location}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm text-gray-500">Deliverables</span>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{bookingDetails?.deliverables}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span className="text-gray-700">Total Paid (Escrow)</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      ₹{bookingDetails?.totalPaid.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    <Download className="h-5 w-5 text-gray-500" />
                    Download Receipt
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    <Share2 className="h-5 w-5 text-gray-500" />
                    Share
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    <Bell className="h-5 w-5 text-gray-500" />
                    Add to Calendar
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* What's Next Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">What's Next</h3>
              
              <div className="space-y-0">
                <TimelineStep
                  step={1}
                  title="Booking Confirmed"
                  description="Payment received and held in escrow"
                  isCompleted={true}
                  isCurrent={false}
                />
                
                <TimelineStep
                  step={2}
                  title="Pre-Event Communication"
                  description="Discuss details with your creator"
                  isCompleted={false}
                  isCurrent={true}
                />
                
                <TimelineStep
                  step={3}
                  title="Event Day"
                  description="Your creator captures the magic"
                  isCompleted={false}
                  isCurrent={false}
                />
                
                <TimelineStep
                  step={4}
                  title="Delivery & Review"
                  description="Review and approve deliverables"
                  isCompleted={false}
                  isCurrent={false}
                />
                
                <TimelineStep
                  step={5}
                  title="Complete & Rate"
                  description="Payment released, leave a review"
                  isCompleted={false}
                  isCurrent={false}
                />
              </div>

              {/* Tips Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700 mb-1">Pro Tip</p>
                    <p className="text-sm text-blue-600">
                      Use the chat feature to share inspiration boards and discuss specific shots you want captured.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link href={`/client/chat/${requestId}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-3"
              >
                <MessageCircle className="h-5 w-5" />
                Message Your Creator
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
            
            <Link href={`/client/dashboard/${clientId}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-8 py-4 bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all flex items-center gap-3"
              >
                <Home className="h-5 w-5" />
                Go to Dashboard
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
