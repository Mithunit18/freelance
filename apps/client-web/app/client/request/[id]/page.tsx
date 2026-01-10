'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Camera, 
  Package as PackageIcon, 
  AlertCircle, 
  Loader, 
  Palette, 
  DollarSign,
  Send,
  Sparkles,
  User,
  Star,
  FileText,
  MessageSquare,
  ArrowRight,
  Shield,
  Verified,
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation'; 
import { getCreator, Creator, requestProject } from '@/services/creatorProfile';
import { formatDate } from '@/utils/helper';
import { useWizardStore } from '@/stores/WizardStore';
import { verifySession } from '@/services/clientAuth';
import { Header } from '@/components/layout/Header';
import { cn } from '@vision-match/utils-js';
import { palette, themeClasses } from '@/utils/theme';

const NA = "Not available";

// Detail Card Component - Landing Page Style
const DetailCard = ({ 
  icon: Icon, 
  label, 
  value, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 group hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/30 transition-all duration-300"
  >
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
      style={{ background: palette.pinkGradient }}
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-gray-800 font-semibold truncate capitalize">{value}</p>
    </div>
  </motion.div>
);

export default function RequestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id; 
  const searchParams = useSearchParams();
  const { scrollYProgress } = useScroll();
  
  // Local State
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Auth State
  const [clientId, setClientId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await verifySession();
        if (!user) {
          router.push("/login");
          return;
        }
        // Use email as the client identifier since that's what the auth system returns
        setClientId(user.email || user.id);
      } catch (err) {
        console.error("Auth check failed", err);
        router.push("/login");
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // GET STORE DATA & RESET FUNCTION
  const serviceType = useWizardStore((state) => state.serviceType);
  const category = useWizardStore((state) => state.category);
  const location = useWizardStore((state) => state.location);
  const eventDate = useWizardStore((state) => state.eventDate);
  const duration = useWizardStore((state) => state.duration);
  const styleNotes = useWizardStore((state) => state.styleNotes);
  const referenceImages = useWizardStore((state) => state.referenceImages);
  const pinterestLink = useWizardStore((state) => state.pinterestLink);
  const budget = useWizardStore((state) => state.budget);
  const selectedStyles = useWizardStore((state) => state.selectedStyles);
  const resetWizard = useWizardStore((state) => state.resetWizard);

  const fetchCreator = useCallback(async (creatorId: string) => {
    setLoading(true);
    setError(null);

    try {
      const creatorData = await getCreator(creatorId);
      if (!creatorData) {
        setError("Creator not found");
      }
      setCreator(creatorData);
    } catch (err) {
      console.error("Failed to fetch creator data:", err);
      setError("Unable to load creator details for request.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setHydrated(true); 
  }, []);

  useEffect(() => {
    if (id) {
      fetchCreator(id);
    } else {
      setLoading(false);
      setError("Missing Creator ID in URL.");
    }
  }, [id, fetchCreator]);
  
  // Package Logic - also check if this is an inquiry (no package needed)
  const packageIndexString = searchParams.get('package');
  const isInquiry = searchParams.get('type') === 'inquiry';
  const selectedPackageIndex = packageIndexString ? parseInt(packageIndexString, 10) : null;

  const selectedPackage =
    creator?.packages && selectedPackageIndex !== null && !isNaN(selectedPackageIndex)
      ? creator.packages[selectedPackageIndex]
      : null;

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!creator) {
      setSubmitError("Creator information is missing");
      return;
    }

    // For inquiries, package is optional
    if (!isInquiry && !selectedPackage) {
      setSubmitError("Please select a package first");
      return;
    }

    if (!clientId) {
      setSubmitError("You must be logged in to send a request.");
      return;
    }

    // For inquiries, wizard data is optional - just need a message
    if (isInquiry && !message.trim()) {
      setSubmitError("Please write a message describing your project");
      return;
    }

    // For package requests, require basic wizard data
    if (!isInquiry && (!serviceType || !eventDate || !duration || !location)) {
      setSubmitError("Please complete all required wizard steps before submitting");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const payload = {
        clientId: clientId,
        creatorId: creator.id,
        packageId: selectedPackage?.id || selectedPackageIndex || null,
        packageName: selectedPackage?.name || 'Custom Inquiry',
        packagePrice: selectedPackage?.price || 'To be discussed',
        isInquiry: isInquiry,
        
        serviceType: serviceType || category || 'Photography',
        category,
        location: location || '',
        eventDate: eventDate ? (typeof eventDate === 'string' ? eventDate : (eventDate as any).toISOString?.() || eventDate) : null,
        duration: duration || null,
        budget: budget || 'To be discussed',
        selectedStyles,
        styleNotes,
        pinterestLink,
        referenceImages: referenceImages.map(img => ({
          id: img.id,
          name: img.name,
          url: img.url
        })),
        
        message: message || "",
        
        creatorName: creator.name,
        creatorSpecialisation: creator.specialisation,
      };

      const result = await requestProject(payload);

      if (result.success) {
        setSubmitSuccess(true);
        resetWizard();

        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push(`/client/request/${id}/sent`);
      } else {
        setSubmitError(result.error || "Failed to submit request");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "An unexpected error occurred";
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Loading States - Landing Page Style
  if (!hydrated || isAuthChecking) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: palette.bgGradient }}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[250px] opacity-10" style={{ backgroundColor: palette.purple }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-30 rounded-full" style={{ background: palette.pinkGradient }} />
            <div 
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-200/50"
              style={{ background: palette.ctaGradient }}
            >
              <Loader className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Preparing your request...</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
        </div>
        <motion.div className="text-center relative z-10">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: palette.pinkGradient }}>
            <Loader className="h-7 w-7 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading request details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center p-10 bg-white rounded-[2rem] border border-gray-100 shadow-2xl"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load</h2>
          <p className="text-gray-500 mb-6">{error || "Creator profile could not be loaded."}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="px-8 py-4 font-bold text-white rounded-xl shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 transition-all"
            style={{ background: palette.ctaGradient }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Only require package if not an inquiry
  if (!isInquiry && !selectedPackage) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center p-10 bg-white rounded-[2rem] border border-gray-100 shadow-2xl"
        >
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            style={{ background: palette.purpleGradient }}
          >
            <PackageIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Package Selected</h2>
          <p className="text-gray-500 mb-6">Please go back and select a package first.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={`/client/creator/${id}`}
              className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white rounded-xl shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 transition-all"
              style={{ background: palette.ctaGradient }}
            >
              Select a Package
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: palette.bgGradient }}>
      {/* Background Effects - Same as Landing Page */}
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
      
      <Header />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href={`/client/creator/${id}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to profile
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-200/50"
              style={{ background: palette.ctaGradient }}
            >
              <Send className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-3">
              {isInquiry ? 'Send Inquiry' : 'Request Project'}
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
              {isInquiry 
                ? <>Start a conversation with <span className="font-bold text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>{creator.name ?? NA}</span> to discuss your project.</>
                : <>Send a project request to <span className="font-bold text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>{creator.name ?? NA}</span>. They'll review and respond within 24 hours.</>
              }
            </p>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 backdrop-blur-sm border border-red-200 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              </motion.div>
            )}

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-emerald-50 backdrop-blur-sm border border-emerald-200 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-emerald-700">Request submitted successfully! Redirecting...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Creator & Package Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: palette.pink }} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: palette.pinkGradient }}>
                    <PackageIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {isInquiry ? 'Creator' : 'Selected Package'}
                  </h2>
                </div>
                
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-pink-50/50 rounded-2xl border border-pink-100">
                  {/* Creator Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-lg">
                      <img
                        src={creator.profileImage || '/placeholder.jpg'}
                        alt={creator.name || 'Creator'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: palette.blueGradient }}>
                      <Verified className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-800 font-bold text-lg">
                        {isInquiry ? creator.name : `${selectedPackage?.name} Package`}
                      </h3>
                      {selectedPackage?.popular && (
                        <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full" style={{ background: palette.pinkGradient }}>
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {isInquiry ? creator.specialisation ?? 'Photographer' : `${creator.name} • ${creator.specialisation ?? NA}`}
                    </p>
                  </div>
                  
                  {selectedPackage && (
                    <div className="text-right">
                      <p className="text-2xl font-black text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                        {selectedPackage.price}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{selectedPackage.duration}</p>
                    </div>
                  )}
                  {isInquiry && creator.starting_price && (
                    <div className="text-right">
                      <p className="text-xl font-black text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                        From ₹{creator.starting_price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{creator.price_unit || 'per day'}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Project Details - Show for package requests, simplified for inquiries */}
            {!isInquiry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Decorative Gradient */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: palette.blue }} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: palette.blueGradient }}>
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Your Project Details</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailCard 
                    icon={Camera} 
                    label="Service & Category" 
                    value={`${serviceType}${category ? ` • ${category}` : ''}`}
                    delay={0.25}
                  />
                  <DetailCard 
                    icon={MapPin} 
                    label="Location" 
                    value={location || creator?.location?.city || "Not Specified"}
                    delay={0.3}
                  />
                  <DetailCard 
                    icon={Calendar} 
                    label="Date" 
                    value={formatDate(eventDate)}
                    delay={0.35}
                  />
                  <DetailCard 
                    icon={Clock} 
                    label="Duration" 
                    value={duration ? `${duration} hours` : selectedPackage?.duration || "Not Specified"}
                    delay={0.4}
                  />
                  <DetailCard 
                    icon={DollarSign} 
                    label="Budget Range" 
                    value={budget || "Not Specified"}
                    delay={0.45}
                  />
                  <DetailCard 
                    icon={Palette} 
                    label="Style Preferences" 
                    value={`${selectedStyles.length} styles selected`}
                    delay={0.5}
                  />
                </div>
                </div>
              </motion.div>
            )}

            {/* Message Section - Required for inquiries, optional for package requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isInquiry ? 0.2 : 0.3 }}
              className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: palette.purple }} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: palette.purpleGradient }}>
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {isInquiry ? 'Your Message' : 'Additional Message'}
                  </h2>
                  {!isInquiry && <span className="text-xs text-gray-400 ml-auto font-medium">Optional</span>}
                  {isInquiry && <span className="text-xs font-bold ml-auto" style={{ color: palette.pink }}>Required</span>}
                </div>
                
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {isInquiry 
                    ? 'Tell the creator about your project, event details, and what you\'re looking for'
                    : 'Share any specific requirements, questions, or details about your vision'
                  }
                </p>
                
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder={isInquiry
                    ? "Hi! I'm planning a wedding on [date] at [location]. I'm looking for a photographer who can capture both candid moments and some family portraits. I love your style and would like to discuss availability and pricing..."
                    : "Example: We're planning an outdoor ceremony at sunset. We'd love a mix of candid moments and some posed family portraits..."
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50/80 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all resize-none font-medium"
                />
                <p className="text-xs text-gray-400 mt-3 font-medium">{message.length}/1000 characters</p>
              </div>
            </motion.div>

            {/* What Happens Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isInquiry ? 0.3 : 0.4 }}
              className="relative p-8 bg-white rounded-[2rem] border border-purple-100 overflow-hidden"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50" />
              
              <div className="relative z-10 flex items-start gap-5">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                  style={{ background: palette.purpleGradient }}
                >
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-4">What happens next?</h3>
                  <ul className="space-y-3">
                    {[
                      `Your ${isInquiry ? 'inquiry' : 'request'} will be sent to ${creator.name ?? NA}`,
                      "They'll review and respond within 24 hours",
                      "No payment required until you both agree on terms",
                      "Chat directly with the creator to finalize details"
                    ].map((item, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (isInquiry ? 0.3 : 0.4) + (i * 0.1) }}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${palette.emerald}15` }}>
                          <CheckCircle className="h-4 w-4" style={{ color: palette.emerald }} />
                        </div>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isInquiry ? 0.4 : 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 px-6 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                Go Back
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={submitting || submitSuccess}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                className={cn(
                  "relative flex-1 py-4 px-6 font-bold rounded-2xl overflow-hidden transition-all disabled:opacity-50 text-lg",
                  submitSuccess
                    ? "text-white shadow-lg shadow-emerald-200/50"
                    : "text-white shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50"
                )}
                style={{ background: submitSuccess ? palette.emerald : palette.ctaGradient }}
              >
                {!submitting && !submitSuccess && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Sent Successfully
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {isInquiry ? 'Send Inquiry' : 'Send Request'}
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>
        </div>
      </main>

      {/* Footer - Landing Page Style */}
      <footer className="relative z-10 border-t border-gray-100/50 py-8 bg-white/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-medium">
            © 2025 VisionMatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
