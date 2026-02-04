'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft,
  Send,
  Loader,
  AlertCircle,
  CheckCircle,
  DollarSign,
  User,
  Clock,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { verifySession } from '@/services/clientAuth';
import { getRequest } from '@/services/creatorProfile';
import axiosInstance from '@/utils/axiosInstance';
import { Header } from '@/components/layout/Header';
import { cn } from '@vision-match/utils-js';

// Brand palette
const palette = {
  pink: "#ec4899",
  purple: "#a855f7",
  blue: "#3b82f6",
  bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
  brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
};

interface Message {
  id: string;
  sender: 'client' | 'creator';
  senderId: string;
  message: string;
  price?: number;
  deliverables?: string;
  type: 'text' | 'offer' | 'counter' | 'accepted';
  timestamp: number;
}

export default function CreatorChatPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const requestId = params.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // For offers
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDeliverables, setOfferDeliverables] = useState('');

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth Check & Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await verifySession();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserId(user.email || user.id);
        
        const requestData = await getRequest(requestId);
        if (!requestData) {
          setError('Request not found');
          return;
        }
        setRequest(requestData);
        
        // Fetch messages - correct response path is .messages
        const messagesRes = await axiosInstance.get(`/projects/${requestId}/messages`);
        setMessages(messagesRes.data?.messages || []);
      } catch (err: unknown) {
        console.error('Error:', err);
        setError('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(async () => {
      try {
        const messagesRes = await axiosInstance.get(`/projects/${requestId}/messages`);
        setMessages(messagesRes.data?.messages || []);
      } catch (err: unknown) {
        console.error('Error polling messages:', err);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [requestId, router]);

  // Send Message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    setSending(true);
    try {
      await axiosInstance.post(`/projects/${requestId}/messages`, {
        sender: 'creator',
        senderId: userId,
        message: messageInput,
        type: 'text',
      });
      
      setMessageInput('');
      
      // Refresh messages - correct response path is .messages
      const messagesRes = await axiosInstance.get(`/projects/${requestId}/messages`);
      setMessages(messagesRes.data?.messages || []);
    } catch (err: unknown) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  // Send Offer
  const handleSendOffer = async () => {
    if (!offerPrice) return;
    
    setSending(true);
    try {
      await axiosInstance.post(`/projects/${requestId}/messages`, {
        sender: 'creator',
        senderId: userId,
        message: `I'd like to propose the following offer:`,
        price: parseFloat(offerPrice),
        deliverables: offerDeliverables,
        type: 'offer',
      });
      
      setOfferPrice('');
      setOfferDeliverables('');
      setShowOfferForm(false);
      
      // Refresh messages - correct response path is .messages
      const messagesRes = await axiosInstance.get(`/projects/${requestId}/messages`);
      setMessages(messagesRes.data?.messages || []);
    } catch (err: unknown) {
      console.error('Failed to send offer:', err);
    } finally {
      setSending(false);
    }
  };

  // Accept Offer (when client sends counter)
  const handleAcceptOffer = async (msg: Message) => {
    try {
      setSending(true);
      // Send an "accepted" type message
      await axiosInstance.post(`/projects/${requestId}/messages`, {
        sender: 'creator',
        senderId: userId,
        message: 'Offer accepted! We have a deal.',
        type: 'accepted',
        price: msg.price,
        deliverables: msg.deliverables,
      });
      
      // Refresh request and messages
      const requestData = await getRequest(requestId);
      setRequest(requestData);
      const messagesRes = await axiosInstance.get(`/projects/${requestId}/messages`);
      setMessages(messagesRes.data?.messages || []);
    } catch (err: unknown) {
      console.error('Failed to accept offer:', err);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'Chat not found'}</h2>
          <Link href="/creator/dashboard" className="text-pink-500 font-semibold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: palette.bgGradient }}>
      <Header />
      
      {/* Chat Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/creator/requests/${requestId}`} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800">
              Chat with {request.clientId?.split('@')[0] || 'Client'}
            </h1>
            <p className="text-sm text-gray-500">
              {request.package?.name || 'Project Inquiry'} • {request.package?.price || 'Price TBD'}
            </p>
          </div>
          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            Negotiating
          </span>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  msg.sender === 'creator' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Accepted Message - Special Display */}
                {msg.type === 'accepted' ? (
                  <div className="w-full max-w-[80%] mx-auto p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-emerald-800 mb-1">Offer Accepted!</p>
                    <p className="text-sm text-emerald-600 mb-2">₹{msg.price?.toLocaleString()} • {msg.deliverables}</p>
                    <p className="text-xs text-gray-500">{msg.message}</p>
                  </div>
                ) : (
                <div className={cn(
                  "max-w-[70%] rounded-2xl p-4",
                  msg.sender === 'creator'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white border border-gray-200'
                )}>
                  {/* Offer Message */}
                  {(msg.type === 'offer' || msg.type === 'counter') && (
                    <div className={cn(
                      "mb-2 p-3 rounded-xl",
                      msg.sender === 'creator' ? 'bg-white/20' : 'bg-gray-50'
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className={cn("h-4 w-4", msg.sender === 'creator' ? 'text-white' : 'text-pink-500')} />
                        <span className="font-bold">
                          {msg.type === 'offer' ? 'Offer' : 'Counter Offer'}: ₹{msg.price?.toLocaleString()}
                        </span>
                      </div>
                      {msg.deliverables && (
                        <p className={cn("text-sm", msg.sender === 'creator' ? 'text-white/80' : 'text-gray-600')}>
                          {msg.deliverables}
                        </p>
                      )}
                      {msg.sender === 'client' && msg.type === 'counter' && request.status === 'negotiating' && (
                        <button
                          onClick={() => handleAcceptOffer(msg)}
                          disabled={sending}
                          className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Accept This Offer
                        </button>
                      )}
                    </div>
                  )}
                  
                  <p className={msg.sender === 'creator' ? 'text-white' : 'text-gray-800'}>
                    {msg.message}
                  </p>
                  <p className={cn(
                    "text-xs mt-2",
                    msg.sender === 'creator' ? 'text-white/60' : 'text-gray-400'
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Offer Form */}
      <AnimatePresence>
        {showOfferForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border-t border-gray-200 px-4 py-4"
          >
            <div className="max-w-4xl mx-auto">
              <h3 className="font-bold text-gray-800 mb-3">Send an Offer</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Price (₹)</label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Deliverables</label>
                  <input
                    type="text"
                    value={offerDeliverables}
                    onChange={(e) => setOfferDeliverables(e.target.value)}
                    placeholder="100 edited photos, 5 min video"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSendOffer}
                  disabled={!offerPrice || sending}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {sending ? <Loader className="h-5 w-5 animate-spin" /> : 'Send Offer'}
                </button>
                <button
                  onClick={() => setShowOfferForm(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Message Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={() => setShowOfferForm(!showOfferForm)}
            className="px-4 py-3 bg-purple-100 text-purple-700 font-semibold rounded-xl hover:bg-purple-200 transition-colors"
          >
            <DollarSign className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sending}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
