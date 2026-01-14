'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Camera, 
  Settings, 
  User, 
  Bell,
  MessageCircle,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  Loader,
  ChevronRight,
  Inbox,
  Package,
  ArrowRight,
  Star,
  Eye,
  Phone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Auth } from '@/services/Auth';
import { getCreatorRequests, updateRequestStatus, getCreator, getPaymentStatusByRequest, initiateCall } from '@/services/creatorProfile';
import { Header } from '@/components/layout/Header';
import { cn } from '@vision-match/utils-js';
import { toast } from 'react-hot-toast';

// Brand palette
const palette = {
  pink: "#ec4899",
  purple: "#a855f7",
  blue: "#3b82f6",
  emerald: "#059669",
  bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
  brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
  ctaGradient: "linear-gradient(to right, #ec4899, #3b82f6)",
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ElementType; label: string }> = {
    pending_creator: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending Review' },
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, label: 'Accepted' },
    declined: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Declined' },
    negotiation_proposed: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: MessageCircle, label: 'Negotiating' },
    negotiating: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: MessageCircle, label: 'Negotiating' },
    paid: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: DollarSign, label: 'Paid' },
    escrowed: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: CheckCircle, label: 'Payment Held' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, label: 'Completed' },
  };

  const config = statusConfig[status] || statusConfig.pending_creator;
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
      config.bg, config.text, config.border
    )}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

// Request Card Component
const RequestCard = ({ 
  request, 
  onAccept, 
  onDecline, 
  onNegotiate,
  paymentStatus,
  onCallClient,
}: { 
  request: any;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onNegotiate: (id: string) => void;
  paymentStatus?: { status: string; clientPhone?: string };
  onCallClient: (requestId: string, clientId: string, clientPhone?: string) => void;
}) => {
  const isPending = request.status === 'pending_creator';
  const isInquiry = request.isInquiry;
  const canCall = paymentStatus && (paymentStatus.status === 'escrowed' || paymentStatus.status === 'completed');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-pink-200 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-gray-900">
              {isInquiry ? 'New Inquiry' : request.package?.name || 'Project Request'}
            </h3>
            {isInquiry && (
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                Inquiry
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            From: {request.clientId?.split('@')[0] || 'Client'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={request.status} />
          {paymentStatus && <StatusBadge status={paymentStatus.status} />}
        </div>
      </div>
      
      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Camera className="h-4 w-4 text-pink-500" />
          <span>{request.serviceType || 'Photography'}</span>
        </div>
        {request.eventDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>{new Date(request.eventDate).toLocaleDateString()}</span>
          </div>
        )}
        {request.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{request.location}</span>
          </div>
        )}
        {request.package?.price && (
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span>{request.package.price}</span>
          </div>
        )}
      </div>
      
      {/* Message Preview */}
      {request.message && (
        <div className="p-3 bg-gray-50 rounded-xl mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">{request.message}</p>
        </div>
      )}
      
      {/* Action Buttons */}
      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(request.id)}
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Accept
          </button>
          <button
            onClick={() => onNegotiate(request.id)}
            className="flex-1 py-2.5 px-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Negotiate
          </button>
          <button
            onClick={() => onDecline(request.id)}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {!isPending && (
        <div className="flex gap-2 flex-wrap">
          {(request.status === 'negotiating' || request.status === 'negotiation_proposed') && (
            <Link
              href={`/creator/requests/${request.id}/chat`}
              className="flex-1 py-2.5 px-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Open Chat
            </Link>
          )}
          <Link
            href={`/creator/requests/${request.id}`}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all",
              (request.status === 'negotiating' || request.status === 'negotiation_proposed' || canCall) ? "" : "flex-1 w-full"
            )}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Link>
          {/* Call Client button - show when payment is escrowed or completed */}
          {canCall && (
            <button
              onClick={() => onCallClient(request.id, request.clientId, paymentStatus?.clientPhone)}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-200/50"
            >
              <Phone className="h-4 w-4" />
              Call Client
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  
  // Payment status map: requestId -> payment status
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, { status: string; clientPhone?: string }>>({});
  
  // Call States
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callRequestId, setCallRequestId] = useState<string | null>(null);
  const [creatorPhone, setCreatorPhone] = useState('');
  const [isCallingInProgress, setIsCallingInProgress] = useState(false);
  
  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await Auth.me();
        if (!user) {
          router.push('/login');
          return;
        }
        // Use email as creator ID
        setCreatorId(user.user.email);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch Creator Profile and Requests
  useEffect(() => {
    const fetchData = async () => {
      if (!creatorId) return;
      
      setIsLoading(true);
      try {
        // Fetch creator profile details
        const profile = await getCreator(creatorId);
        setCreatorProfile(profile);
        
        // Fetch requests
        const data = await getCreatorRequests(creatorId);
        setRequests(data);
        
        // Fetch payment statuses for paid/accepted requests
        const paidRequests = data.filter((r: any) => 
          r.status === 'paid' || r.status === 'accepted'
        );
        
        if (paidRequests.length > 0) {
          const statusPromises = paidRequests.map(async (req: any) => {
            const payment = await getPaymentStatusByRequest(req.id);
            if (payment) {
              return { 
                requestId: req.id, 
                status: payment.status,
                clientPhone: payment.client_phone || req.clientPhone || null
              };
            }
            return null;
          });
          
          const statuses = await Promise.all(statusPromises);
          const statusMap: Record<string, { status: string; clientPhone?: string }> = {};
          statuses.forEach(s => {
            if (s) {
              statusMap[s.requestId] = { status: s.status, clientPhone: s.clientPhone };
            }
          });
          setPaymentStatuses(statusMap);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [creatorId]);

  // Action Handlers
  const handleAccept = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'accept', 'I would be happy to work with you!');
      // Refresh requests
      if (creatorId) {
        const data = await getCreatorRequests(creatorId);
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'decline', 'Sorry, I am not available for this date.');
      if (creatorId) {
        const data = await getCreatorRequests(creatorId);
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  const handleNegotiate = (requestId: string) => {
    router.push(`/creator/requests/${requestId}/chat`);
  };

  // Call client handler - opens modal to get creator's phone
  const handleCallClient = (requestId: string, clientId: string, clientPhone?: string) => {
    setCallRequestId(requestId);
    setCallModalOpen(true);
  };

  // Filter requests
  const pendingRequests = requests.filter(r => r.status === 'pending_creator');
  const displayedRequests = activeTab === 'pending' ? pendingRequests : requests;

  // Stats
  const stats = {
    pending: pendingRequests.length,
    total: requests.length,
    accepted: requests.filter(r => r.status === 'accepted').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl" style={{ background: palette.brandGradient }}>
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
      </div>
      
      <Header />
      
      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Card */}
          {creatorProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {creatorProfile.profileImage || creatorProfile.profile_photo ? (
                    <img 
                      src={creatorProfile.profileImage || creatorProfile.profile_photo} 
                      alt={creatorProfile.name || creatorProfile.full_name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center" style={{ background: palette.brandGradient }}>
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Profile Info */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {creatorProfile.name || creatorProfile.full_name || 'Your Name'}
                      </h2>
                      <p className="text-pink-500 font-medium">
                        {creatorProfile.specialisation || creatorProfile.role || 'Creator'}
                      </p>
                    </div>
                    <Link 
                      href="/creator/onboarding"
                      className="px-4 py-2 text-sm font-semibold text-pink-500 bg-pink-50 rounded-xl hover:bg-pink-100 transition-all flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {creatorProfile.city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{creatorProfile.city}</span>
                      </div>
                    )}
                    {creatorProfile.years_experience && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{creatorProfile.years_experience} years exp</span>
                      </div>
                    )}
                    {(creatorProfile.rating || creatorProfile.rating === 0) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm">{creatorProfile.rating?.toFixed(1) || '0.0'} rating</span>
                      </div>
                    )}
                    {creatorProfile.starting_price && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">From ₹{creatorProfile.starting_price?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {creatorProfile.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2">{creatorProfile.bio}</p>
                  )}
                  
                  {/* Tags */}
                  {(creatorProfile.style_tags?.length > 0 || creatorProfile.tags?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(creatorProfile.style_tags || creatorProfile.tags || []).slice(0, 4).map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Completeness Bar */}
              {(creatorProfile.profile_completeness !== undefined && creatorProfile.profile_completeness < 100) && (
                <div className="px-6 pb-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-amber-800">Profile Completeness</span>
                      <span className="text-sm font-bold text-amber-600">{creatorProfile.profile_completeness}%</span>
                    </div>
                    <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${creatorProfile.profile_completeness}%`,
                          background: palette.brandGradient
                        }}
                      />
                    </div>
                    <p className="text-xs text-amber-600 mt-2">Complete your profile to attract more clients!</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: palette.brandGradient }}>
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {creatorProfile?.name ? `Welcome, ${creatorProfile.name.split(' ')[0]}!` : 'Creator Dashboard'}
                </h1>
                <p className="text-gray-500">Manage your bookings and inquiries</p>
              </div>
            </div>
          </motion.div>
          
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                <Inbox className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Link href="/creator/profile" className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-pink-200 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: palette.brandGradient }}>
                <User className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm text-gray-500">My Profile</p>
              <p className="text-sm font-semibold text-pink-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                View <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          </motion.div>
          
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 mb-6"
          >
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-4 py-2 rounded-xl font-semibold transition-all",
                activeTab === 'pending'
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/50"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-4 py-2 rounded-xl font-semibold transition-all",
                activeTab === 'all'
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/50"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              All Requests ({stats.total})
            </button>
          </motion.div>
          
          {/* Requests List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {displayedRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {activeTab === 'pending' ? 'No pending requests' : 'No requests yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'pending' 
                    ? 'All caught up! Check back later for new inquiries.' 
                    : 'When clients send you requests, they will appear here.'}
                </p>
                <Link
                  href="/creator/profile"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-xl shadow-lg shadow-pink-200/50"
                  style={{ background: palette.ctaGradient }}
                >
                  <User className="h-5 w-5" />
                  Complete Your Profile
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedRequests.map((request, index) => (
                  <RequestCard
                    key={request.id || index}
                    request={request}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onNegotiate={handleNegotiate}
                    paymentStatus={paymentStatuses[request.id]}
                    onCallClient={handleCallClient}
                  />
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Link href="/creator/onboarding" className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all group">
              <User className="w-8 h-8 text-pink-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800">Profile Setup</h3>
              <p className="text-sm text-gray-500 mt-1">Complete your creator profile</p>
            </Link>
            
            <Link href="/creator/onboarding/portfolio" className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all group">
              <Camera className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800">Portfolio</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your work samples</p>
            </Link>
            
            <Link href="/creator/onboarding/pricing" className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all group">
              <Package className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800">Packages & Pricing</h3>
              <p className="text-sm text-gray-500 mt-1">Set up your service packages</p>
            </Link>
          </motion.div>
          
          {/* Call Client Modal */}
          <AnimatePresence>
            {callModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => {
                  if (!isCallingInProgress) {
                    setCallModalOpen(false);
                    setCreatorPhone('');
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Call Client</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Enter your phone number to connect with the client securely
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Phone Number
                      </label>
                      <input
                        type="tel"
                        value={creatorPhone}
                        onChange={(e) => setCreatorPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                        placeholder="Enter your 10-digit phone number"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        disabled={isCallingInProgress}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        We&apos;ll call you first, then connect you to the client
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Secure Call Masking</p>
                          <p className="text-xs text-emerald-600 mt-0.5">
                            Your phone number is kept private. Neither party sees the other&apos;s real number.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setCallModalOpen(false);
                          setCreatorPhone('');
                        }}
                        disabled={isCallingInProgress}
                        className="flex-1 py-3 px-5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!creatorPhone || creatorPhone.length < 10) {
                            toast.error('Please enter a valid 10-digit phone number');
                            return;
                          }
                          if (!callRequestId || !creatorId) {
                            toast.error('Missing call details');
                            return;
                          }

                          setIsCallingInProgress(true);
                          try {
                            const result = await initiateCall(
                              callRequestId,
                              creatorId,
                              creatorPhone,
                              'creator'
                            );

                            if (result.success) {
                              toast.success(result.message || 'Call initiated! You will receive a call shortly.');
                              setCallModalOpen(false);
                              setCreatorPhone('');
                            } else {
                              toast.error(result.message || 'Failed to initiate call');
                            }
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to initiate call');
                          } finally {
                            setIsCallingInProgress(false);
                          }
                        }}
                        disabled={isCallingInProgress || !creatorPhone || creatorPhone.length < 10}
                        className="flex-1 py-3 px-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCallingInProgress ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4" />
                            Call Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Footer */}
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