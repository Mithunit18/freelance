'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Camera,
  Clock,
  DollarSign,
  User,
  Package,
  MessageCircle,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  FileText,
  Palette,
  Link as LinkIcon,
  Image,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { verifySession } from '@/services/clientAuth';
import { getRequest, updateRequestStatus } from '@/services/creatorProfile';
import { Email } from '@/services/email';
import { Header } from '@/components/layout/Header';
import { cn } from '@vision-match/utils-js';

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

// Detail Card Component
const DetailCard = ({ 
  icon: Icon, 
  label, 
  value, 
  gradient 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  gradient?: string;
}) => (
  <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100">
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
      style={{ background: gradient || palette.brandGradient }}
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-gray-800 font-semibold truncate">{value}</p>
    </div>
  </div>
);

export default function CreatorRequestDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const requestId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Auth Check & Fetch Request
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await verifySession();
        if (!user) {
          router.push('/login');
          return;
        }
        
        const data = await getRequest(requestId);
        if (!data) {
          setError('Request not found');
        } else {
          setRequest(data);
        }
      } catch (err: unknown) {
        console.error('Error:', err);
        setError('Failed to load request');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [requestId, router]);

  // Action Handlers
  const handleAction = async (action: 'accept' | 'decline' | 'negotiate') => {
    setActionLoading(action);
    try {
      const message = action === 'accept' 
        ? 'I would be happy to work with you!' 
        : action === 'decline' 
          ? 'Sorry, I am not available for this date.'
          : 'Let\'s discuss the details further.';
      
      await updateRequestStatus(requestId, action, message);
      
      // Send email notification to client
      if (request && (action === 'accept' || action === 'decline')) {
        try {
          if (action === 'accept') {
            await Email.sendBookingAcceptedEmail({
              client_email: request.clientId,
              client_name: request.clientId?.split('@')[0] || 'Client',
              creator_name: request.creatorName || 'Creator',
              service_type: request.serviceType || request.category,
              event_date: request.eventDate,
              location: request.location,
              final_price: request.finalOffer?.price ? String(request.finalOffer.price) : request.package?.price,
              booking_id: requestId
            });
          } else if (action === 'decline') {
            await Email.sendBookingDeclinedEmail({
              client_email: request.clientId,
              client_name: request.clientId?.split('@')[0] || 'Client',
              creator_name: request.creatorName || 'Creator',
              booking_id: requestId,
              decline_message: message
            });
          }
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr);
        }
      }
      
      // Refresh the request
      const data = await getRequest(requestId);
      setRequest(data);
      
      if (action === 'negotiate') {
        router.push(`/creator/requests/${requestId}/chat`);
      }
    } catch (err: unknown) {
      console.error(`Failed to ${action} request:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl" style={{ background: palette.brandGradient }}>
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading request...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'Request not found'}</h2>
          <Link href="/creator/dashboard" className="mt-4 inline-flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const isPending = request.status === 'pending_creator';
  const isInquiry = request.isInquiry;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
      </div>
      
      <Header />
      
      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link 
              href="/creator/dashboard"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {isInquiry ? 'Project Inquiry' : request.package?.name || 'Project Request'}
                </h1>
                {isInquiry && (
                  <span className="px-3 py-1 text-sm font-bold bg-blue-100 text-blue-700 rounded-full">
                    Inquiry
                  </span>
                )}
              </div>
              <p className="text-gray-500">Request ID: {request.id}</p>
            </div>
            <StatusBadge status={request.status} />
          </motion.div>

          {/* Client Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.brandGradient }}>
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Client Information</h2>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {request.clientId?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{request.clientId?.split('@')[0] || 'Client'}</p>
                <p className="text-sm text-gray-500">{request.clientId}</p>
              </div>
            </div>
          </motion.div>

          {/* Package & Price */}
          {request.package && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Package Details</h2>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                <div>
                  <p className="font-bold text-gray-800">{request.package.name}</p>
                  <p className="text-sm text-gray-500">{request.duration ? `${request.duration} hours` : 'Duration TBD'}</p>
                </div>
                <p className="text-2xl font-black text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                  {request.package.price}
                </p>
              </div>
            </motion.div>
          )}

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Project Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailCard 
                icon={Camera} 
                label="Service Type" 
                value={request.serviceType || 'Photography'}
                gradient="linear-gradient(to right, #ec4899, #db2777)"
              />
              {request.eventDate && (
                <DetailCard 
                  icon={Calendar} 
                  label="Event Date" 
                  value={new Date(request.eventDate).toLocaleDateString()}
                  gradient="linear-gradient(to right, #a855f7, #9333ea)"
                />
              )}
              {request.location && (
                <DetailCard 
                  icon={MapPin} 
                  label="Location" 
                  value={request.location}
                  gradient="linear-gradient(to right, #3b82f6, #2563eb)"
                />
              )}
              {request.budget && (
                <DetailCard 
                  icon={DollarSign} 
                  label="Budget" 
                  value={request.budget}
                  gradient="linear-gradient(to right, #059669, #047857)"
                />
              )}
            </div>
          </motion.div>

          {/* Style Preferences */}
          {(request.selectedStyles?.length > 0 || request.styleNotes) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Style Preferences</h2>
              </div>
              {request.selectedStyles?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {request.selectedStyles.map((style: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-200">
                      {style}
                    </span>
                  ))}
                </div>
              )}
              {request.styleNotes && (
                <p className="text-gray-600 p-3 bg-gray-50 rounded-xl">{request.styleNotes}</p>
              )}
            </motion.div>
          )}

          {/* Client Message */}
          {request.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Client Message</h2>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
              </div>
            </motion.div>
          )}

          {/* Reference Images / Pinterest */}
          {(request.pinterestLink || request.referenceImages?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">References</h2>
              </div>
              {request.pinterestLink && (
                <a 
                  href={request.pinterestLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl mb-3 hover:bg-red-100 transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                  Pinterest Board
                </a>
              )}
              {request.referenceImages?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {request.referenceImages.map((img: any, i: number) => (
                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                      <img src={img.url} alt={img.name} className="w-full h-24 object-cover rounded-lg" />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => handleAction('accept')}
                disabled={!!actionLoading}
                className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'accept' ? <Loader className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                Accept Request
              </button>
              <button
                onClick={() => handleAction('negotiate')}
                disabled={!!actionLoading}
                className="flex-1 py-4 px-6 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'negotiate' ? <Loader className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                Start Negotiation
              </button>
              <button
                onClick={() => handleAction('decline')}
                disabled={!!actionLoading}
                className="py-4 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'decline' ? <Loader className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                Decline
              </button>
            </motion.div>
          )}

          {/* Chat Link for Negotiation Status */}
          {(request.status === 'negotiation_proposed' || request.status === 'negotiating') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href={`/creator/requests/${requestId}/chat`}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-200/50"
              >
                <MessageCircle className="h-5 w-5" />
                Continue Negotiation
              </Link>
            </motion.div>
          )}

          {/* Awaiting Payment - Show when accepted */}
          {request.status === 'accepted' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center"
            >
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Offer Accepted!</h3>
              <p className="text-gray-600">Waiting for client to complete payment.</p>
            </motion.div>
          )}

          {/* Booking Confirmed - Show when paid */}
          {request.status === 'paid' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center"
            >
              <DollarSign className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Payment Received!</h3>
              <p className="text-gray-600 mb-4">This booking is confirmed. Funds are held in escrow until project completion.</p>
              <Link
                href={`/creator/requests/${requestId}/chat`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Message Client
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
