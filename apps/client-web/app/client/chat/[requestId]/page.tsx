'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video, 
  Check, CheckCheck, CheckCircle, Clock, DollarSign, Calendar, MapPin,
  Shield, AlertCircle, Loader, Camera, Star, User,
  MessageCircle, FileText, ChevronRight, Package,
  Sparkles, X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { verifySession } from '@/services/clientAuth';
import { getRequest, counterOffer, acceptOffer, sendNegotiationMessage, getNegotiationMessages } from '@/services/creatorProfile';
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

type Message = {
  id: string;
  sender: 'client' | 'creator' | 'system';
  type: 'text' | 'offer' | 'counter' | 'accepted' | 'system';
  text?: string;
  price?: number;
  deliverables?: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
};

type RequestDetails = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage?: string;
  creatorRole?: string;
  status: string;
  projectType: string;
  eventDate: string;
  location: string;
  budget: string;
  currentOffer?: {
    price: number;
    deliverables: string;
  };
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // States
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null);
  
  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  
  // Negotiation modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterDeliverables, setCounterDeliverables] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  
  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await verifySession();
        if (!user) {
          router.push('/login');
          return;
        }
        // Auth returns email as the primary identifier, not id
        setClientId(user.email || user.id || user._id);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch request details
  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;
    
    try {
      setLoading(true);
      const data = await getRequest(requestId);
      
      // Load messages from backend
      const messagesData = await getNegotiationMessages(requestId);
      let currentOffer = data?.current_offer || data?.currentOffer || null;
      
      // If messages exist, find the latest offer/counter from creator to use as currentOffer
      if (messagesData?.length) {
        const offerMessages = messagesData.filter(
          (m: any) => (m.type === 'offer' || m.type === 'counter') && m.sender === 'creator'
        );
        if (offerMessages.length > 0) {
          const latestOffer = offerMessages[offerMessages.length - 1];
          currentOffer = {
            price: latestOffer.price,
            deliverables: latestOffer.deliverables,
          };
        }
        
        setMessages(messagesData.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          type: m.type || 'text',
          text: m.message,
          price: m.price,
          deliverables: m.deliverables,
          timestamp: new Date(m.timestamp),
          status: m.status || 'sent',
        })));
      }
      
      if (data) {
        setRequestDetails({
          id: data.id || data._id,
          creatorId: data.creator_id || data.creatorId,
          creatorName: data.creator_name || data.creatorName || data.creatorName || 'Creator',
          creatorImage: data.creator_image || data.creatorImage,
          creatorRole: data.creator_role || data.creatorRole || 'Photographer',
          status: data.status || 'pending',
          projectType: data.project_type || data.projectType || data.category || data.serviceType,
          eventDate: data.event_date || data.eventDate,
          location: data.location,
          budget: data.budget,
          currentOffer: currentOffer,
        });
      }
    } catch (err) {
      console.error('Failed to fetch request:', err);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (clientId && requestId) {
      fetchRequestDetails();
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(async () => {
        try {
          const messagesData = await getNegotiationMessages(requestId);
          if (messagesData?.length) {
            setMessages(messagesData.map((m: any) => ({
              id: m.id,
              sender: m.sender,
              type: m.type || 'text',
              text: m.message,
              price: m.price,
              deliverables: m.deliverables,
              timestamp: new Date(m.timestamp),
              status: m.status || 'sent',
            })));
          }
        } catch (err) {
          console.error('Error polling messages:', err);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [clientId, requestId, fetchRequestDetails]);

  // Message validation (no personal contact info)
  const validateMessage = (text: string): { valid: boolean; error?: string } => {
    const phoneRegex = /\b\d{10}\b|\+\d{1,3}\d{9,14}/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;

    if (phoneRegex.test(text)) return { valid: false, error: 'Phone numbers are not allowed for your protection.' };
    if (emailRegex.test(text)) return { valid: false, error: 'Email addresses are not allowed for your protection.' };
    if (linkRegex.test(text)) return { valid: false, error: 'External links are not allowed for your protection.' };

    return { valid: true };
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending || !clientId) return;
    
    const validation = validateMessage(messageInput);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid message');
      return;
    }
    
    setSending(true);
    
    try {
      // Send message to backend
      await sendNegotiationMessage(requestId, {
        sender: 'client',
        senderId: clientId,
        message: messageInput,
        type: 'text',
      });
      
      setMessageInput('');
      
      // Refresh messages from backend
      const messagesData = await getNegotiationMessages(requestId);
      if (messagesData?.length) {
        setMessages(messagesData.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          type: m.type || 'text',
          text: m.message,
          price: m.price,
          deliverables: m.deliverables,
          timestamp: new Date(m.timestamp),
          status: m.status || 'sent',
        })));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Send counter offer
  const handleCounterOffer = async () => {
    if (!counterPrice || !counterDeliverables.trim() || !clientId) {
      toast.error('Please enter price and deliverables');
      return;
    }
    
    try {
      setSending(true);
      
      await counterOffer(requestId, {
        senderId: clientId,
        price: parseFloat(counterPrice),
        deliverables: counterDeliverables,
        message: counterMessage || 'Here is my counter offer',
      });
      
      setShowOfferModal(false);
      setCounterPrice('');
      setCounterDeliverables('');
      setCounterMessage('');
      toast.success('Counter offer sent!');
      
      // Refresh messages from backend
      const messagesData = await getNegotiationMessages(requestId);
      if (messagesData?.length) {
        setMessages(messagesData.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          type: m.type || 'text',
          text: m.message,
          price: m.price,
          deliverables: m.deliverables,
          timestamp: new Date(m.timestamp),
          status: m.status || 'sent',
        })));
      }
    } catch (err) {
      console.error('Failed to send counter offer:', err);
      toast.error('Failed to send counter offer');
    } finally {
      setSending(false);
    }
  };

  // Accept offer
  const handleAcceptOffer = async () => {
    if (!clientId || !requestDetails?.currentOffer) {
      toast.error('No offer to accept');
      return;
    }
    
    try {
      setSending(true);
      await acceptOffer(
        requestId, 
        clientId, 
        requestDetails.currentOffer.price, 
        requestDetails.currentOffer.deliverables
      );
      
      toast.success('Offer accepted! Redirecting to payment...');
      
      // Refresh messages
      const messagesData = await getNegotiationMessages(requestId);
      if (messagesData?.length) {
        setMessages(messagesData.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          type: m.type || 'text',
          text: m.message,
          price: m.price,
          deliverables: m.deliverables,
          timestamp: new Date(m.timestamp),
          status: m.status || 'sent',
        })));
      }
      
      setTimeout(() => {
        router.push(`/client/payment/${requestId}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to accept offer:', err);
      toast.error('Failed to accept offer');
    } finally {
      setSending(false);
    }
  };

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
          <p className="text-gray-600 font-medium text-lg">Loading conversation...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-blue-50/30 relative overflow-hidden flex flex-col">
      {/* Animated Background - Light Theme */}
      <FloatingOrb className="w-[400px] h-[400px] bg-pink-400 -top-32 -left-32" delay={0} />
      <FloatingOrb className="w-[300px] h-[300px] bg-purple-400 top-1/2 -right-32" delay={2} />
      
      {/* Grid pattern - Light */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Chat Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/client/dashboard/${clientId}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {requestDetails?.creatorImage ? (
                      <img 
                        src={requestDetails.creatorImage} 
                        alt={requestDetails.creatorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                
                <div>
                  <h2 className="font-semibold text-gray-900">{requestDetails?.creatorName}</h2>
                  <p className="text-sm text-gray-500">{requestDetails?.creatorRole}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
              >
                <Phone className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
              >
                <Video className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
              >
                <MoreVertical className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info Banner */}
      <div className="relative z-10 bg-gray-50/80 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Camera className="h-4 w-4 text-pink-500" />
                <span>{requestDetails?.projectType || 'Project'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>{requestDetails?.eventDate || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>{requestDetails?.location || 'TBD'}</span>
              </div>
            </div>
            
            <Link href={`/client/request/${requestDetails?.creatorId}?view=details`}>
              <span className="text-sm text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1">
                View Details <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Security Notice */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6"
          >
            <Shield className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700">
              Messages are monitored. Sharing personal contact info is restricted for your safety.
            </p>
          </motion.div>

          {/* Current Offer Card */}
          {requestDetails?.currentOffer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-900">Current Offer from Creator</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-white/80 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    ₹{requestDetails.currentOffer.price.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Deliverables</p>
                  <p className="text-sm text-gray-900">{requestDetails.currentOffer.deliverables}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAcceptOffer}
                  disabled={sending}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                  Accept & Pay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowOfferModal(true)}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-all"
                >
                  Counter Offer
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex",
                message.sender === 'client' ? 'justify-end' : 
                message.sender === 'system' ? 'justify-center' : 'justify-start'
              )}
            >
              {message.type === 'system' || message.sender === 'system' ? (
                <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  {message.text}
                </div>
              ) : message.type === 'accepted' ? (
                <div className="w-full max-w-[80%] mx-auto p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-emerald-800 mb-1">Offer Accepted!</p>
                  <p className="text-sm text-emerald-600 mb-2">₹{message.price?.toLocaleString()} • {message.deliverables}</p>
                  <p className="text-xs text-gray-500">{message.text}</p>
                  {message.sender === 'client' && requestDetails?.status !== 'paid' && (
                    <Link href={`/client/payment/${requestId}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-3 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl"
                      >
                        Proceed to Payment
                      </motion.button>
                    </Link>
                  )}
                </div>
              ) : message.type === 'offer' || message.type === 'counter' ? (
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl",
                  message.sender === 'client' 
                    ? "bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200"
                    : "bg-white border border-gray-200 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium text-pink-600">
                      {message.type === 'counter' ? 'Counter Offer' : 'Offer'}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-1">₹{message.price?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{message.deliverables}</p>
                  {message.text && (
                    <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      "{message.text}"
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-2 text-xs text-gray-400">
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.sender === 'client' && (
                      message.status === 'read' ? <CheckCheck className="h-3 w-3 text-blue-500" /> :
                      message.status === 'delivered' ? <CheckCheck className="h-3 w-3" /> :
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "max-w-[70%] px-4 py-3 rounded-2xl",
                  message.sender === 'client' 
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                )}>
                  <p>{message.text}</p>
                  <div className={cn(
                    "flex items-center justify-end gap-1 mt-1 text-xs",
                    message.sender === 'client' ? "opacity-70" : "text-gray-400"
                  )}>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.sender === 'client' && (
                      message.status === 'read' ? <CheckCheck className="h-3 w-3 text-blue-200" /> :
                      message.status === 'delivered' ? <CheckCheck className="h-3 w-3" /> :
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
            >
              <Paperclip className="h-5 w-5" />
            </motion.button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sending}
              className={cn(
                "p-3.5 rounded-xl transition-all",
                messageInput.trim() 
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30"
                  : "bg-gray-100 border border-gray-200 text-gray-400"
              )}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Counter Offer Modal */}
      <AnimatePresence>
        {showOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowOfferModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Make Counter Offer</h3>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Your Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Enter your price"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Expected Deliverables
                  </label>
                  <textarea
                    value={counterDeliverables}
                    onChange={(e) => setCounterDeliverables(e.target.value)}
                    placeholder="e.g., 100 edited photos, 5 minute highlight video..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    placeholder="Add a note to your offer..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-3 bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCounterOffer}
                  disabled={!counterPrice || !counterDeliverables.trim() || sending}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Offer'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
