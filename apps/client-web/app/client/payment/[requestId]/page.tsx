'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CreditCard, Shield, Lock, Check, CheckCircle, 
  AlertCircle, Loader, Calendar, MapPin, Camera, User,
  IndianRupee, FileText, Package, Clock, Sparkles,
  Building2, Smartphone, QrCode, ChevronRight
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

type PaymentMethod = 'upi' | 'card' | 'netbanking';

type OrderDetails = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage?: string;
  projectType: string;
  eventDate: string;
  location: string;
  totalAmount: number;
  platformFee: number;
  gst: number;
  finalAmount: number;
  deliverables: string;
};

// Payment method card component - LIGHT THEME
const PaymentMethodCard = ({ 
  method, 
  icon: Icon, 
  title, 
  description, 
  selected, 
  onClick 
}: { 
  method: PaymentMethod;
  icon: React.ElementType;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-xl border-2 text-left transition-all",
      selected 
        ? "border-pink-500 bg-pink-50" 
        : "border-gray-200 bg-white hover:border-pink-300"
    )}
  >
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
        selected 
          ? "bg-gradient-to-br from-pink-500 to-purple-600" 
          : "bg-gray-100"
      )}>
        <Icon className={cn("h-6 w-6", selected ? "text-white" : "text-gray-500")} />
      </div>
      <div className="flex-1">
        <p className={cn("font-semibold", selected ? "text-gray-900" : "text-gray-700")}>{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
        selected ? "border-pink-500 bg-pink-500" : "border-gray-300"
      )}>
        {selected && <Check className="h-4 w-4 text-white" />}
      </div>
    </div>
  </motion.button>
);

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;
  
  // States
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  
  // Payment states
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await verifySession();
        if (!user) {
          router.push('/login');
          return;
        }
        // Use email as primary identifier (consistent with auth system)
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

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    if (!requestId) return;
    
    try {
      setLoading(true);
      const data = await getRequest(requestId);
      
      if (data) {
        const baseAmount = data.current_offer?.price || data.currentOffer?.price || 25000;
        const platformFee = Math.round(baseAmount * 0.10); // 10% platform fee
        const gst = Math.round((baseAmount + platformFee) * 0.18); // 18% GST
        const finalAmount = baseAmount + platformFee + gst;
        
        setOrderDetails({
          id: data.id || data._id,
          creatorId: data.creator_id || data.creatorId,
          creatorName: data.creator_name || data.creatorName || 'Creator',
          creatorImage: data.creator_image || data.creatorImage,
          projectType: data.project_type || data.projectType || data.category || 'Photography',
          eventDate: data.event_date || data.eventDate || 'TBD',
          location: data.location || 'TBD',
          totalAmount: baseAmount,
          platformFee,
          gst,
          finalAmount,
          deliverables: data.current_offer?.deliverables || data.currentOffer?.deliverables || 'As discussed',
        });
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (clientId && requestId) {
      fetchOrderDetails();
    }
  }, [clientId, requestId, fetchOrderDetails]);

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Process payment
  const handlePayment = async () => {
    if (!orderDetails) return;
    
    // Validate based on selected method
    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    if (selectedMethod === 'card' && (cardNumber.replace(/\s/g, '').length < 16 || !cardExpiry || !cardCvv || !cardName)) {
      toast.error('Please fill all card details');
      return;
    }
    if (selectedMethod === 'netbanking' && !selectedBank) {
      toast.error('Please select a bank');
      return;
    }
    
    setProcessing(true);
    
    try {
      // TODO: Integrate with Razorpay
      // const options = {
      //   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      //   amount: orderDetails.finalAmount * 100, // in paise
      //   currency: 'INR',
      //   name: 'VisionMatch',
      //   description: `Booking for ${orderDetails.projectType}`,
      //   order_id: orderId, // from backend
      //   handler: function (response: any) {
      //     // Verify payment on backend
      //   },
      //   prefill: { ... },
      //   theme: { color: '#ec4899' }
      // };
      // const rzp = new window.Razorpay(options);
      // rzp.open();
      
      // Simulate payment for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Payment successful!');
      router.push(`/client/booking/${requestId}/confirmation`);
    } catch (err) {
      console.error('Payment failed:', err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
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
          <p className="text-gray-600 font-medium text-lg">Loading payment details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-blue-50/30 relative overflow-hidden">
      {/* Animated Background - Light Theme */}
      <FloatingOrb className="w-[500px] h-[500px] bg-pink-400 -top-32 -left-32" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-purple-400 top-1/3 -right-32" delay={2} />
      <FloatingOrb className="w-[350px] h-[350px] bg-blue-400 bottom-0 left-1/4" delay={4} />
      
      {/* Grid pattern - Light */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <Header />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href={`/client/chat/${requestId}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Chat</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-200 mb-4"
            >
              <Lock className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-semibold text-pink-700">Secure Payment</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Complete Your Booking
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Your payment is protected with escrow. Funds are only released when you approve the final deliverables.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Select Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h2>
                
                <div className="space-y-3">
                  <PaymentMethodCard
                    method="upi"
                    icon={QrCode}
                    title="UPI"
                    description="Pay using any UPI app"
                    selected={selectedMethod === 'upi'}
                    onClick={() => setSelectedMethod('upi')}
                  />
                  
                  <PaymentMethodCard
                    method="card"
                    icon={CreditCard}
                    title="Credit / Debit Card"
                    description="Visa, Mastercard, RuPay"
                    selected={selectedMethod === 'card'}
                    onClick={() => setSelectedMethod('card')}
                  />
                  
                  <PaymentMethodCard
                    method="netbanking"
                    icon={Building2}
                    title="Net Banking"
                    description="All major banks supported"
                    selected={selectedMethod === 'netbanking'}
                    onClick={() => setSelectedMethod('netbanking')}
                  />
                </div>
              </motion.div>

              {/* Payment Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
                
                <AnimatePresence mode="wait">
                  {selectedMethod === 'upi' && (
                    <motion.div
                      key="upi"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          A payment request will be sent to your UPI app
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {selectedMethod === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Name on Card</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          placeholder="JOHN DOE"
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {selectedMethod === 'netbanking' && (
                    <motion.div
                      key="netbanking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Select Bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Choose your bank</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="pnb">Punjab National Bank</option>
                          <option value="bob">Bank of Baroda</option>
                          <option value="other">Other Banks</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-700">
                          You'll be redirected to your bank's secure payment page
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Security Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-6 py-4"
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Lock className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Check className="h-5 w-5 text-pink-500" />
                  <span className="text-sm">Escrow Protected</span>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 sticky top-24 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Creator Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {orderDetails?.creatorImage ? (
                      <img 
                        src={orderDetails.creatorImage}
                        alt={orderDetails.creatorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-7 w-7 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{orderDetails?.creatorName}</p>
                    <p className="text-sm text-gray-500">{orderDetails?.projectType}</p>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-pink-500" />
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-900 ml-auto">{orderDetails?.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-500">Location:</span>
                    <span className="text-gray-900 ml-auto">{orderDetails?.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-500">Deliverables:</span>
                    <span className="text-gray-900 ml-auto text-right max-w-[150px] truncate">{orderDetails?.deliverables}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">₹{orderDetails?.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Platform Fee (10%)</span>
                    <span className="text-gray-900">₹{orderDetails?.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (18%)</span>
                    <span className="text-gray-900">₹{orderDetails?.gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      ₹{orderDetails?.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Pay Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Pay ₹{orderDetails?.finalAmount.toLocaleString()}
                    </>
                  )}
                </motion.button>

                {/* Escrow Notice */}
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700">
                      Payment held in escrow. Released to creator only after you approve final deliverables.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
